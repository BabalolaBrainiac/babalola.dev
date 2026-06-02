# Infrastructure Complete: Wardscribe in Production (Part 2 - Execution)

**Published:** May 2026

**Tags:** #Infrastructure #DevOps #Automation #CI-CD #Go #Production #LearningInPublic #Wardscribe #Architecture

## Table of Contents

- [Planning vs Reality](#planning-vs-reality)
- [Zero-Trust Tunnel Architecture](#zero-trust-tunnel-architecture)
- [Container Orchestration & Service Mesh](#container-orchestration--service-mesh)
- [CLI Application Hardening](#cli-application-hardening)
- [Shared HTTP Client Pattern](#shared-http-client-pattern)
- [Deployment Pipeline & Automation](#deployment-pipeline--automation)
- [Network Topology & Security](#network-topology--security)
- [Stateless Design Trade-Offs](#stateless-design-trade-offs)
- [WardMind Architecture Integration](#wardmind-architecture-integration)
- [What Diverged From The Plan](#what-diverged-from-the-plan)
- [What Comes Next](#what-comes-next)

---

## Planning vs Reality

The plan in Part 1 was clean: move the infrastructure, standardize the application layer, build automation. In practice, it was more complex. The infrastructure migration was straightforward. The application layer was not.

Running in production with thousands of active endpoints, the platform had accumulated surface-level compromises. Thirteen separate CLI command implementations, each maintaining its own HTTP client with different timeout strategies. Configuration files written without file permission controls, exposing auth tokens on shared systems. Stub commands left in the codebase as placeholders. URL path construction without escaping.

None of these were catastrophic in isolation. Together, they represented technical debt that made the system hard to reason about and audit. The execution required two parallel workstreams: fix the infrastructure and fix the application layer simultaneously.

## Zero-Trust Tunnel Architecture

The outbound-only tunnel pattern deserves technical depth because it's the foundation of the security model.

Traditional reverse proxy: server listens on a public port, firewall allows inbound traffic from the internet, requests route through the network stack.

Outbound tunnel: server dials out to a CDN edge location, holds a persistent TLS connection, the CDN routes inbound requests back through that tunnel.

Why this matters:

- The server never has a public IP bound to any interface
- There is no listening socket on port 80, 443, or any other public port
- The firewall only needs to allow outbound HTTPS on port 443 to known CDN IPs
- The attack surface is reduced to what's needed to maintain the tunnel connection

In practice, the docker-compose setup follows this pattern:

```yaml
services:
  <application-service>:
    image: <app-image>:<version>
    networks:
      - internal
    environment:
      API_URL: http://<application-service>:<internal-port>
    ports:
      - "<internal-port>"
    depends_on:
      - <database-service>
      - <cache-service>

  tunnel-client:
    image: <tunnel-provider-image>:<version>
    networks:
      - internal
    volumes:
      - <config-path>/<tunnel-config-file>:<tunnel-config-mount>:ro
    environment:
      TUNNEL_TOKEN: <tunnel-auth-token>
    restart: always
    command: tunnel run --token ${TUNNEL_TOKEN}

  <database-service>:
    image: <database-image>:<version>
    networks:
      - internal
    volumes:
      - <database-volume>:<database-mount-path>
    environment:
      <DATABASE>_PASSWORD: <database-password>

  <cache-service>:
    image: <cache-image>:<version>
    networks:
      - internal
    volumes:
      - <cache-volume>:<cache-mount-path>

networks:
  internal:
    driver: bridge
    ipam:
      config:
        - subnet: <private-network-range>

volumes:
  <database-volume>:
  <cache-volume>:
```

The key detail: all services sit on a private network (10.0.9.0/24). No service is bound to a public interface. The tunnel client is the only egress point, and it maintains a single persistent connection to the edge.

## Container Orchestration & Service Mesh

Docker Compose was chosen over Kubernetes. The reasoning:

- Single physical server (ARM-based, ~3.79 EUR/month)
- No horizontal scaling required at this stage
- Deployment is idempotent and version-controlled
- No additional orchestration overhead

The tradeoff: service discovery is static (hardcoded hostnames on the internal network). This works because there's no dynamic scaling, and the network topology is predictable.

Health checks are defined per service:

```yaml
<service-name>:
  healthcheck:
    test: ["CMD", "curl", "-f", "<service-endpoint>/<health-path>"]
    interval: <check-interval>s
    timeout: <timeout>s
    retries: <retry-count>
    start_period: <startup-delay>s
```

The orchestration layer is kept simple: define service dependencies, manage volumes, control restart policies. The deployment automation (CI/CD) handles the release cycle.

## CLI Application Hardening

The CLI layer had structural issues that needed fixing before the migration could be considered complete.

Multiple command implementations, each instantiating an HTTP client with different configurations:

```go
// Before: repeated pattern across many commands
func (c *<Command1>) Run() error {
    client := &http.Client{
        Timeout: <timeout-value-1>,
    }
    resp, err := client.Get(c.registryURL + "<api-endpoint-1>")
    // ...
}

func (c *<Command2>) Run() error {
    client := &http.Client{
        Timeout: <timeout-value-2>,  // inconsistent timeout
    }
    resp, err := client.Get(c.registryURL + "<api-endpoint-2>")  // inconsistent path
    // ...
}
```

This pattern led to subtle inconsistencies: different timeout strategies, inconsistent API paths, and duplicated authentication logic across implementations.

## Shared HTTP Client Pattern

The fix was a dedicated client package that became the single source of truth:

```go
package api

import (
    "context"
    "fmt"
    "net/http"
    "net/url"
    "time"
)

type Client struct {
    base    string
    token   string
    apiKey  string
    timeout time.Duration
    http    *http.Client
}

func New(cfg *config.Config) *Client {
    return &Client{
        base:    fmt.Sprintf("%s/<api-version>", cfg.RegistryURL),
        token:   cfg.AuthToken,
        apiKey:  cfg.APIKey,
        timeout: <default-timeout>,
        http: &http.Client{
            Timeout: <default-timeout>,
        },
    }
}

func (c *Client) Get(ctx context.Context, path string) (*http.Response, error) {
    req, err := http.NewRequestWithContext(ctx, "GET", c.base+path, nil)
    if err != nil {
        return nil, err
    }
    c.setAuth(req)
    return c.http.Do(req)
}

func (c *Client) Post(ctx context.Context, path string, body io.Reader) (*http.Response, error) {
    req, err := http.NewRequestWithContext(ctx, "POST", c.base+path, body)
    if err != nil {
        return nil, err
    }
    c.setAuth(req)
    req.Header.Set("Content-Type", "application/json")
    return c.http.Do(req)
}

func (c *Client) setAuth(req *http.Request) {
    if c.token != "" {
        req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
    } else if c.apiKey != "" {
        req.Header.Set("X-API-Key", c.apiKey)
    }
}
```

Every command now uses this single client. The base URL is always `<registry>/api/v1`. Auth is handled once. Timeouts are consistent. If the API contract changes, there's one place to update.

Additionally, the config file was being written without file permissions:

```go
// Before: world-readable auth token
viper.WriteConfigAs(configPath)  // writes with 0644

// After: user-only readable
data, _ := yaml.Marshal(cfg)
os.WriteFile(configPath, data, 0600)  // mode: rw-------
```

URL construction had path injection risk:

```go
// Before: no escaping
path := fmt.Sprintf("/objects/%s/versions", userProvidedSlug)

// After: proper escaping
path := fmt.Sprintf("/objects/%s/versions", url.PathEscape(userProvidedSlug))
```

## Deployment Pipeline & Automation

The deployment pipeline is defined in CircleCI 2.1, with each step delegated to scripts rather than inline commands:

```yaml
version: 2.1

jobs:
  test-<service>:
    docker:
      - image: <build-image>:<version>
    steps:
      - checkout
      - run:
          name: Run tests
          command: ./scripts/test-<service>.sh
      - run:
          name: Run linting
          command: ./scripts/lint-<service>.sh

  release-<artifact>:
    docker:
      - image: <build-image>:<version>
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: ./scripts/install-release-tools.sh
      - run:
          name: Create release
          command: ./scripts/release-<artifact>.sh

workflows:
  test-and-deploy:
    jobs:
      - test-<backend>
      - test-<cli>
      - test-<e2e>
      
      - release-<artifact>:
          requires:
            - test-<cli>
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
```

The pipeline is declarative: code is pushed, tests run in parallel, scripts handle the complexity. Each step is decoupled from the pipeline definition, making changes easier without modifying CI/CD configuration. If tests pass, the release script is triggered on git tags to build cross-platform artifacts.

## Network Topology & Security

The server sits behind the tunnel with SSH access restricted:

```
User ─── curl request ─┬─ Public DNS (blocked, no records)
                       │
                       └─ CDN Edge (accepts connection)
                           │
                           └─ Tunnel Client (persistent encrypted channel)
                               │
                               └─ Server Firewall (allows tunnel egress)
                                   │
                                   └─ Private Network (isolated, internal only)
                                       │
                                       ├─ <application-service> (internal, not exposed)
                                       ├─ <database-service> (internal, not exposed)
                                       └─ <cache-service> (internal, not exposed)
```

SSH access is key-based, restricted to specific IPs, and logged. The server has no public IP. The only open port is 22, and it's only reachable if you know:

1. The actual server IP (not in DNS)
2. Your SSH key is authorized
3. Your origin IP is whitelisted

This is defensible because the attack surface is finite. Scanning the server's public IPs yields nothing. Compromising DNS doesn't expose the server. A DDoS against the domain is absorbed at the edge.

## Stateless Design Trade-Offs

The new architecture is designed to be stateless at the application layer. The API should be runnable anywhere, with connections to postgres and redis providing the only state.

This means:

1. No files on disk (except Docker volumes for databases)
2. No session state in memory
3. All sessions live in Redis or postgres
4. Any instance of the API can handle any request

The tradeoff: every request hits the database. There's no local caching at the API level. For the current scale, this is fine. It becomes a bottleneck when request volume grows significantly, at which point Redis would be upgraded or a caching layer (Varnish, varnish-cache) would be added.

## WardMind Architecture Integration

WardMind is the inference engine and will be the next major architectural component to integrate.

Currently, the deployment is: User -> API -> Postgres/Redis. WardMind needs to be: User -> API -> Queue -> Workers -> Inference Engine -> Result Storage -> API -> User.

This is asynchronous by necessity. Inference (even with fast models) can take seconds. The API can't block waiting for results.

The planned architecture:

1. API receives a request, validates it, creates a task in a queue (likely Temporal, which is already running)
2. Workers pick up tasks from the queue
3. Workers invoke WardMind (the inference service)
4. WardMind runs the model, returns predictions
5. Workers store results in postgres or a separate cache layer
6. API polls or uses webhooks to fetch results and return to user

The question is: where does WardMind live?

Option A: WardMind as a service in docker-compose, local to the server
- Pro: simple deployment, direct network communication
- Con: uses server resources (GPU memory if available), scales with single server

Option B: WardMind as a separate container cluster
- Pro: independent scaling, isolates compute-heavy workload
- Con: additional infrastructure complexity, networking overhead

Option C: WardMind as a managed service
- Pro: no operations overhead, automatic scaling
- Con: vendor lock-in, latency, cost per inference

The tradeoff matrix is complex and depends on model size, latency requirements, and concurrent request volume. This is where Part 3 and beyond will focus: deciding on WardMind placement, building the training pipeline, and managing the MLOps infrastructure.

## What Diverged From The Plan

The original plan assumed infrastructure and application cleanup were separate workstreams. They weren't. The application code was tightly coupled to deployment assumptions. Configuration needed to know the infrastructure topology. Deployment scripts assumed how binaries were built.

So the work expanded: infrastructure, application, deployment, and distribution all had to move together. The plan was right directionally but underestimated the coupling.

The second surprise: the application cleanup revealed upstream issues. Testing was ad-hoc. CLI binaries were being built manually. There was no consistent error handling across services. These weren't in the original scope, but they needed addressing before the platform could be considered production-grade.

## What Comes Next

Part 1 was planning the migration. Part 2 was executing it and hardening the application layer. Part 3 will focus on integrating WardMind and building the MLOps infrastructure.

The next phase involves:

1. Defining the inference queue and worker architecture
2. Deciding where WardMind lives (local, separate cluster, or managed service)
3. Building a training pipeline that feeds new models into the inference system
4. Instrumenting observability so model performance can be monitored in production
5. Setting up A/B testing for model deployments

This is where the infrastructure becomes truly multi-layer: data ingestion, model training, inference, and result serving all need to coexist on a single logical platform.

Part 3 will document the decisions made and the rationale. For now, the foundation is solid.

---

*This is Part 2 of an ongoing series documenting a full infrastructure migration and platform hardening. Part 1 covered the plan. Part 3 will cover WardMind integration and MLOps infrastructure.*
