use anyhow::{anyhow, bail, Context, Result};
use axum::{
    extract::{Request, State},
    http::{HeaderMap, Method, StatusCode, Uri},
    response::{IntoResponse, Response},
    routing::any,
    Router,
};
use chrono::Utc;
use hmac::{Hmac, Mac};
use reqwest::{redirect::Policy as RedirectPolicy, Client};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::Sha256;
use std::{
    collections::{BTreeMap, HashSet},
    net::{IpAddr, SocketAddr},
    path::{Path, PathBuf},
    sync::Arc,
};
use tokio::net::TcpListener;
use url::Url;
use uuid::Uuid;

pub const REDACTED: &str = "[REDACTED]";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedactionPolicy {
    #[serde(default = "default_headers")]
    pub headers: Vec<String>,
    #[serde(default = "default_fields")]
    pub json_fields: Vec<String>,
}

fn default_headers() -> Vec<String> {
    [
        "authorization",
        "cookie",
        "set-cookie",
        "x-api-key",
        "x-signature",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

fn default_fields() -> Vec<String> {
    [
        "email",
        "phone",
        "token",
        "secret",
        "password",
        "card_number",
        "customer_email",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

impl Default for RedactionPolicy {
    fn default() -> Self {
        Self {
            headers: default_headers(),
            json_fields: default_fields(),
        }
    }
}

impl RedactionPolicy {
    pub fn load(path: Option<&Path>) -> Result<Self> {
        match path {
            Some(path) => {
                serde_json::from_slice(&std::fs::read(path).with_context(|| {
                    format!("could not read redaction policy {}", path.display())
                })?)
                .with_context(|| format!("redaction policy {} is not valid JSON", path.display()))
            }
            None => Ok(Self::default()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exchange {
    pub schema_version: u8,
    pub id: String,
    pub captured_at: String,
    pub trace_id: Option<String>,
    pub request: RecordedRequest,
    pub response: RecordedResponse,
    #[serde(default)]
    pub redactions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedRequest {
    pub method: String,
    pub path: String,
    pub headers: BTreeMap<String, String>,
    pub body: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedResponse {
    pub status: u16,
    pub headers: BTreeMap<String, String>,
    pub body: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BundleManifest {
    pub schema_version: u8,
    pub created_at: String,
    pub fixture_count: usize,
    pub fixtures: Vec<String>,
}

fn header_map(headers: &HeaderMap) -> BTreeMap<String, String> {
    headers
        .iter()
        .filter_map(|(name, value)| {
            value
                .to_str()
                .ok()
                .map(|v| (name.as_str().to_ascii_lowercase(), v.to_string()))
        })
        .collect()
}

fn body_value(bytes: &[u8], content_type: Option<&str>) -> Value {
    if content_type.unwrap_or("").contains("json") {
        serde_json::from_slice(bytes)
            .unwrap_or_else(|_| Value::String(String::from_utf8_lossy(bytes).to_string()))
    } else {
        Value::String(String::from_utf8_lossy(bytes).to_string())
    }
}

pub fn scrub_exchange(exchange: &mut Exchange, policy: &RedactionPolicy) {
    exchange.redactions.clear();
    let headers: HashSet<String> = policy
        .headers
        .iter()
        .map(|h| h.to_ascii_lowercase())
        .collect();
    let fields: HashSet<String> = policy
        .json_fields
        .iter()
        .map(|h| h.to_ascii_lowercase())
        .collect();
    scrub_headers(
        &mut exchange.request.headers,
        &headers,
        "request",
        &mut exchange.redactions,
    );
    scrub_headers(
        &mut exchange.response.headers,
        &headers,
        "response",
        &mut exchange.redactions,
    );
    scrub_value(
        &mut exchange.request.body,
        &fields,
        "request.body",
        &mut exchange.redactions,
    );
    scrub_value(
        &mut exchange.response.body,
        &fields,
        "response.body",
        &mut exchange.redactions,
    );
}

fn scrub_headers(
    map: &mut BTreeMap<String, String>,
    names: &HashSet<String>,
    side: &str,
    log: &mut Vec<String>,
) {
    for (name, value) in map.iter_mut() {
        if names.contains(&name.to_ascii_lowercase()) {
            *value = REDACTED.into();
            log.push(format!("{side}.headers.{name}"));
        }
    }
}

fn scrub_value(value: &mut Value, names: &HashSet<String>, path: &str, log: &mut Vec<String>) {
    match value {
        Value::Object(map) => {
            for (key, child) in map {
                let next = format!("{path}.{key}");
                if names.contains(&key.to_ascii_lowercase()) {
                    *child = Value::String(REDACTED.into());
                    log.push(next);
                } else {
                    scrub_value(child, names, &next, log);
                }
            }
        }
        Value::Array(items) => {
            for (index, item) in items.iter_mut().enumerate() {
                scrub_value(item, names, &format!("{path}[{index}]"), log);
            }
        }
        _ => {}
    }
}

pub fn write_exchange(path: &Path, exchange: &Exchange) -> Result<()> {
    let bytes = serde_json::to_vec_pretty(exchange)?;
    std::fs::write(path, bytes)
        .with_context(|| format!("could not write scrubbed capture {}", path.display()))
}

pub fn export_bundle(
    captures: &Path,
    out: &Path,
    policy: &RedactionPolicy,
) -> Result<BundleManifest> {
    if !captures.is_dir() {
        bail!("capture folder {} does not exist", captures.display());
    }
    std::fs::create_dir_all(out.join("fixtures"))
        .with_context(|| format!("could not create bundle {}", out.display()))?;
    let mut entries: Vec<PathBuf> = std::fs::read_dir(captures)?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().and_then(|s| s.to_str()) == Some("json"))
        .collect();
    entries.sort();
    let mut fixture_names = Vec::new();
    for path in entries {
        let mut exchange: Exchange = serde_json::from_slice(&std::fs::read(&path)?)
            .with_context(|| format!("capture {} has an invalid schema", path.display()))?;
        scrub_exchange(&mut exchange, policy);
        let name = format!("{}.json", safe_id(&exchange.id));
        write_exchange(&out.join("fixtures").join(&name), &exchange)?;
        fixture_names.push(name);
    }
    if fixture_names.is_empty() {
        bail!("no JSON captures found in {}", captures.display());
    }
    let manifest = BundleManifest {
        schema_version: 1,
        created_at: Utc::now().to_rfc3339(),
        fixture_count: fixture_names.len(),
        fixtures: fixture_names,
    };
    std::fs::write(
        out.join("manifest.json"),
        serde_json::to_vec_pretty(&manifest)?,
    )?;
    Ok(manifest)
}

fn safe_id(id: &str) -> String {
    let cleaned: String = id
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect();
    if cleaned.is_empty() {
        Uuid::new_v4().to_string()
    } else {
        cleaned
    }
}

pub fn load_bundle(path: &Path) -> Result<Vec<Exchange>> {
    let manifest: BundleManifest = serde_json::from_slice(
        &std::fs::read(path.join("manifest.json"))
            .with_context(|| format!("bundle manifest missing in {}", path.display()))?,
    )
    .context("bundle manifest has an invalid schema")?;
    manifest
        .fixtures
        .iter()
        .map(|name| {
            let path = path.join("fixtures").join(name);
            serde_json::from_slice(&std::fs::read(&path)?)
                .with_context(|| format!("fixture {} is invalid", path.display()))
        })
        .collect()
}

fn loopback_socket(value: &str) -> Result<SocketAddr> {
    let addr: SocketAddr = value
        .parse()
        .with_context(|| format!("{value} is not a valid IP:port"))?;
    if !addr.ip().is_loopback() {
        bail!("refusing non-loopback address {addr}; use 127.0.0.1 or [::1]");
    }
    Ok(addr)
}

fn local_target(value: &str) -> Result<Url> {
    let url = Url::parse(value).with_context(|| format!("{value} is not a valid URL"))?;
    if !matches!(url.scheme(), "http" | "https") {
        bail!("target must use http or https");
    }
    let host = url
        .host_str()
        .ok_or_else(|| anyhow!("target has no host"))?;
    let local = host.eq_ignore_ascii_case("localhost")
        || host.parse::<IpAddr>().is_ok_and(|ip| ip.is_loopback());
    if !local {
        bail!("refusing non-local target {host}; replay is limited to localhost");
    }
    Ok(url)
}

/// A boundary operation must never turn an explicitly allowed first hop into an
/// implicit second hop.  In particular, a redirect can cross from localhost to
/// a production host after the initial URL has passed validation.  Returning
/// the redirect response is useful to callers and keeps the complete target
/// choice explicit.
fn boundary_client() -> Result<Client> {
    Client::builder()
        .redirect(RedirectPolicy::none())
        .build()
        .context("could not create the HTTP client")
}

#[derive(Clone)]
struct CaptureState {
    upstream: Url,
    out: PathBuf,
    policy: RedactionPolicy,
    client: Client,
}

pub async fn run_capture(
    listen: &str,
    upstream: &str,
    out: &Path,
    policy: RedactionPolicy,
) -> Result<()> {
    let addr = loopback_socket(listen)?;
    let upstream = Url::parse(upstream).context("upstream is not a valid URL")?;
    if !matches!(upstream.scheme(), "http" | "https") {
        bail!("upstream must use http or https");
    }
    std::fs::create_dir_all(out)?;
    println!("forwarding to {upstream}");
    let state = CaptureState {
        upstream,
        out: out.to_path_buf(),
        policy,
        client: boundary_client()?,
    };
    let app = Router::new()
        .fallback(any(capture_handler))
        .with_state(state);
    let listener = TcpListener::bind(addr).await?;
    println!("capturing opted-in traffic on http://{addr}");
    println!("writing scrubbed exchanges to {}", out.display());
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown())
        .await?;
    Ok(())
}

async fn capture_handler(State(state): State<CaptureState>, request: Request) -> Response {
    match capture_one(state, request).await {
        Ok(response) => response,
        Err(error) => (StatusCode::BAD_GATEWAY, format!("capture failed: {error}")).into_response(),
    }
}

async fn capture_one(state: CaptureState, request: Request) -> Result<Response> {
    let (parts, raw_request) = request.into_parts();
    let request_bytes = axum::body::to_bytes(raw_request, 10 * 1024 * 1024).await?;
    let mut target = state.upstream.clone();
    target.set_path(parts.uri.path());
    target.set_query(parts.uri.query());
    let mut forward = state.client.request(parts.method.clone(), target);
    for (name, value) in &parts.headers {
        if !matches!(name.as_str(), "host" | "content-length") {
            forward = forward.header(name, value);
        }
    }
    let upstream = forward.body(request_bytes.clone()).send().await?;
    let status = upstream.status();
    let response_headers = upstream.headers().clone();
    let response_bytes = upstream.bytes().await?;
    let trace_id = parts
        .headers
        .get("traceparent")
        .or_else(|| parts.headers.get("x-trace-id"))
        .and_then(|v| v.to_str().ok())
        .map(String::from);
    let mut exchange = Exchange {
        schema_version: 1,
        id: format!(
            "{}-{}",
            Utc::now().format("%Y%m%dT%H%M%S"),
            &Uuid::new_v4().to_string()[..8]
        ),
        captured_at: Utc::now().to_rfc3339(),
        trace_id,
        request: RecordedRequest {
            method: parts.method.to_string(),
            path: parts
                .uri
                .path_and_query()
                .map(|v| v.as_str())
                .unwrap_or("/")
                .to_string(),
            headers: header_map(&parts.headers),
            body: body_value(
                &request_bytes,
                parts
                    .headers
                    .get("content-type")
                    .and_then(|v| v.to_str().ok()),
            ),
        },
        response: RecordedResponse {
            status: status.as_u16(),
            headers: header_map(&response_headers),
            body: body_value(
                &response_bytes,
                response_headers
                    .get("content-type")
                    .and_then(|v| v.to_str().ok()),
            ),
        },
        redactions: Vec::new(),
    };
    scrub_exchange(&mut exchange, &state.policy);
    write_exchange(&state.out.join(format!("{}.json", exchange.id)), &exchange)?;
    let mut response = Response::builder().status(status);
    for (name, value) in &response_headers {
        if !matches!(
            name.as_str(),
            "content-length" | "transfer-encoding" | "connection"
        ) {
            response = response.header(name, value);
        }
    }
    Ok(response.body(axum::body::Body::from(response_bytes))?)
}

#[derive(Clone)]
struct MockState(Arc<Vec<Exchange>>);

pub async fn run_mock(bundle: &Path, listen: &str) -> Result<()> {
    let addr = loopback_socket(listen)?;
    let fixtures = load_bundle(bundle)?;
    let count = fixtures.len();
    let app = Router::new()
        .fallback(any(mock_handler))
        .with_state(MockState(Arc::new(fixtures)));
    let listener = TcpListener::bind(addr).await?;
    println!("serving {count} fixture(s) on http://{addr}");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown())
        .await?;
    Ok(())
}

async fn mock_handler(State(state): State<MockState>, method: Method, uri: Uri) -> Response {
    let path = uri.path_and_query().map(|v| v.as_str()).unwrap_or("/");
    let found = state
        .0
        .iter()
        .find(|f| f.request.method.eq_ignore_ascii_case(method.as_str()) && f.request.path == path);
    let Some(fixture) = found else {
        return (
            StatusCode::NOT_FOUND,
            "No fixture matches this method and path.",
        )
            .into_response();
    };
    let status =
        StatusCode::from_u16(fixture.response.status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
    let mut response = Response::builder().status(status);
    for (name, value) in &fixture.response.headers {
        if !matches!(
            name.as_str(),
            "content-length" | "transfer-encoding" | "connection" | "set-cookie"
        ) {
            response = response.header(name, value);
        }
    }
    let body = value_bytes(&fixture.response.body);
    response
        .body(axum::body::Body::from(body))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

fn value_bytes(value: &Value) -> Vec<u8> {
    match value {
        Value::String(s) => s.as_bytes().to_vec(),
        other => serde_json::to_vec(other).unwrap_or_default(),
    }
}

pub async fn send_webhook(
    bundle: &Path,
    fixture_id: &str,
    target: &str,
    secret_env: &str,
) -> Result<u16> {
    let target = local_target(target)?;
    let fixture = load_bundle(bundle)?
        .into_iter()
        .find(|f| f.id == fixture_id)
        .ok_or_else(|| anyhow!("fixture {fixture_id} was not found"))?;
    let secret = std::env::var(secret_env)
        .with_context(|| format!("environment variable {secret_env} is not set"))?;
    let body = value_bytes(&fixture.request.body);
    let timestamp = Utc::now().timestamp();
    let mut mac =
        Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("HMAC accepts any key length");
    mac.update(timestamp.to_string().as_bytes());
    mac.update(b".");
    mac.update(&body);
    let signature = format!(
        "t={timestamp},v1={}",
        hex::encode(mac.finalize().into_bytes())
    );
    let client = boundary_client()?;
    let method: reqwest::Method = fixture
        .request
        .method
        .parse()
        .context("fixture method is invalid")?;
    let mut request = client
        .request(method, target)
        .body(body)
        .header("x-boundary-replay-signature", signature);
    for (name, value) in &fixture.request.headers {
        if !matches!(
            name.as_str(),
            "authorization" | "cookie" | "x-api-key" | "x-signature" | "host" | "content-length"
        ) && value != REDACTED
        {
            request = request.header(name, value);
        }
    }
    Ok(request.send().await?.status().as_u16())
}

async fn shutdown() {
    let _ = tokio::signal::ctrl_c().await;
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Exchange {
        serde_json::from_str(include_str!("../examples/sample-payment-webhook.json")).unwrap()
    }

    #[test]
    fn redacts_nested_fields_and_headers() {
        let mut fixture = sample();
        scrub_exchange(&mut fixture, &RedactionPolicy::default());
        assert_eq!(fixture.request.headers["authorization"], REDACTED);
        assert_eq!(fixture.request.body["customer_email"], REDACTED);
        assert_eq!(fixture.request.body["card_number"], REDACTED);
        assert!(fixture.redactions.len() >= 4);
        let serialized = serde_json::to_string(&fixture).unwrap();
        assert!(!serialized.contains("maya.chen"));
        assert!(!serialized.contains("4242424242424242"));
    }

    #[test]
    fn exports_a_runnable_bundle() {
        let source = tempfile::tempdir().unwrap();
        let bundle = tempfile::tempdir().unwrap();
        let mut fixture = sample();
        scrub_exchange(&mut fixture, &RedactionPolicy::default());
        write_exchange(&source.path().join("one.json"), &fixture).unwrap();
        let manifest =
            export_bundle(source.path(), bundle.path(), &RedactionPolicy::default()).unwrap();
        assert_eq!(manifest.fixture_count, 1);
        let loaded = load_bundle(bundle.path()).unwrap();
        assert_eq!(loaded[0].response.status, 503);
    }

    #[test]
    fn refuses_non_local_replay_targets() {
        assert!(local_target("https://api.example.com/hooks").is_err());
        assert!(local_target("http://127.0.0.1:3000/hooks").is_ok());
        assert!(loopback_socket("0.0.0.0:9487").is_err());
    }
}
