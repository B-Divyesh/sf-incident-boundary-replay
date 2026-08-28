use anyhow::{Context, Result};
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
        #[arg(long, default_value = "127.0.0.1:8787")]
        listen: String,
        #[arg(long)]
        upstream: String,
        #[arg(long, default_value = "captures")]
        out: PathBuf,
        #[arg(long)]
        redact: Option<PathBuf>,
    },
    /// Export scrubbed captures as a portable mock bundle
    Export {
        #[arg(long)]
        captures: PathBuf,
        #[arg(long)]
        out: PathBuf,
        #[arg(long)]
        redact: Option<PathBuf>,
        #[arg(long)]
        json: bool,
    },
    /// Serve a bundle as a loopback-only HTTP mock
    Serve {
        #[arg(long)]
        bundle: PathBuf,
        #[arg(long, default_value = "127.0.0.1:9487")]
        listen: String,
    },
    /// Re-sign and send one scrubbed webhook to a local service
    Send {
        #[arg(long)]
        bundle: PathBuf,
        #[arg(long)]
        fixture: String,
        #[arg(long)]
        target: String,
        #[arg(long)]
        signing_secret_env: String,
        #[arg(long)]
        json: bool,
    },
    /// Build a temporary mock bundle from shipped sample data
    Demo {
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
            json!({"demo": true, "bundle": bundle, "fixtures": manifest.fixture_count, "saved": false})
        );
    } else {
        println!("Demo — sample data, nothing was read from your captures.");
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
