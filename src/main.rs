use anyhow::{bail, Context, Result};
use boundary_replay::{
    export_bundle, run_capture, run_mock, scrub_exchange, send_webhook, write_exchange, Exchange,
    RedactionPolicy,
};
use clap::{Parser, Subcommand};
use serde_json::json;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Parser)]
#[command(name = "boundary-replay", version, about = "Capture scrubbed HTTP boundaries and run them as local mocks", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Proxy opted-in traffic and write only scrubbed exchanges
    Capture {
        /// Loopback address for the opted-in sidecar, for example 127.0.0.1:8787
        #[arg(long, default_value = "127.0.0.1:8787")]
        listen: String,
        /// Explicit HTTP(S) upstream to capture; redirects are returned, never followed
        #[arg(long)]
        upstream: String,
        /// Folder where scrubbed exchange JSON files are written
        #[arg(long, default_value = "captures")]
        out: PathBuf,
        /// JSON file listing headers and fields to redact
        #[arg(long)]
        redact: Option<PathBuf>,
    },
    /// Export scrubbed captures as a portable mock bundle
    Export {
        /// Folder containing scrubbed capture JSON files
        #[arg(long)]
        captures: PathBuf,
        /// Empty or new folder for the portable bundle
        #[arg(long)]
        out: PathBuf,
        /// JSON file listing headers and fields to redact again before export
        #[arg(long)]
        redact: Option<PathBuf>,
        #[arg(long)]
        json: bool,
    },
    /// Serve a bundle as a loopback-only HTTP mock
    Serve {
        /// Bundle folder containing manifest.json and fixtures
        #[arg(long)]
        bundle: PathBuf,
        /// Loopback address for the local mock, for example 127.0.0.1:9487
        #[arg(long, default_value = "127.0.0.1:9487")]
        listen: String,
    },
    /// Re-sign and send one scrubbed webhook to a local service
    Send {
        /// Bundle folder containing the scrubbed fixture
        #[arg(long)]
        bundle: PathBuf,
        /// Fixture ID from the bundle manifest
        #[arg(long)]
        fixture: String,
        /// Loopback http(s) endpoint; redirects are returned, never followed
        #[arg(long)]
        target: String,
        /// Name of the environment variable containing the local HMAC secret
        #[arg(long)]
        signing_secret_env: String,
        #[arg(long)]
        json: bool,
    },
    /// Build a temporary mock bundle from shipped sample data
    Demo {
        /// Empty or new folder for isolated sample files (defaults to a new temp folder)
        #[arg(long)]
        out: Option<PathBuf>,
        #[arg(long)]
        json: bool,
    },
}

#[tokio::main]
async fn main() {
    if let Err(error) = run().await {
        eprintln!("error: {error:#}");
        std::process::exit(1);
    }
}

async fn run() -> Result<()> {
    match Cli::parse().command {
        Command::Capture {
            listen,
            upstream,
            out,
            redact,
        } => {
            run_capture(
                &listen,
                &upstream,
                &out,
                RedactionPolicy::load(redact.as_deref())?,
            )
            .await
        }
        Command::Export {
            captures,
            out,
            redact,
            json: machine,
        } => {
            let manifest =
                export_bundle(&captures, &out, &RedactionPolicy::load(redact.as_deref())?)?;
            if machine {
                println!(
                    "{}",
                    json!({"bundle": out, "fixtures": manifest.fixture_count})
                );
            } else {
                println!(
                    "exported {} fixture(s) to {}",
                    manifest.fixture_count,
                    out.display()
                );
            }
            Ok(())
        }
        Command::Serve { bundle, listen } => run_mock(&bundle, &listen).await,
        Command::Send {
            bundle,
            fixture,
            target,
            signing_secret_env,
            json: machine,
        } => {
            let status = send_webhook(&bundle, &fixture, &target, &signing_secret_env).await?;
            if machine {
                println!("{}", json!({"fixture": fixture, "status": status}));
            } else {
                println!("sent {fixture}; local service returned {status}");
            }
            Ok(())
        }
        Command::Demo { out, json: machine } => demo(out, machine),
    }
}

fn demo(out: Option<PathBuf>, machine: bool) -> Result<()> {
    let root = out.unwrap_or_else(|| {
        std::env::temp_dir().join(format!(
            "boundary-replay-demo-{}",
            &Uuid::new_v4().to_string()[..8]
        ))
    });
    if root.exists() && std::fs::read_dir(&root)?.next().is_some() {
        bail!(
            "demo output folder {} is not empty; choose a new or empty folder so sample data cannot read or overwrite captures",
            root.display()
        );
    }
    let captures = root.join("captures");
    let bundle = root.join("payment-failure.bundle");
    std::fs::create_dir_all(&captures)
        .with_context(|| format!("could not create demo folder {}", captures.display()))?;
    let mut exchange: Exchange =
        serde_json::from_str(include_str!("../examples/sample-payment-webhook.json"))?;
    scrub_exchange(&mut exchange, &RedactionPolicy::default());
    write_exchange(&captures.join("payment-webhook.json"), &exchange)?;
    let manifest = export_bundle(&captures, &bundle, &RedactionPolicy::default())?;
    if machine {
        println!(
            "{}",
            json!({"demo": true, "bundle": bundle, "fixtures": manifest.fixture_count, "saved": true})
        );
    } else {
        println!("Demo — isolated sample data; no existing captures were read or changed.");
        println!(
            "Scrubbed {} secret or PII field(s) before disk.",
            exchange.redactions.len()
        );
        println!("Bundle: {}", bundle.display());
        println!(
            "Run: boundary-replay serve --bundle {} --listen 127.0.0.1:9487",
            bundle.display()
        );
    }
    Ok(())
}
