# Infrastructure Complete: Wardscribe in Production (Part 2 - Execution)

**Published:** May 2026

**Tags:** #Infrastructure #DevOps #Automation #CI-CD #Go #Production #LearningInPublic #Wardscribe

## Table of Contents

- [What Happened Between Planning and Execution](#what-happened-between-planning-and-execution)
- [The Architecture That Emerged](#the-architecture-that-emerged)
- [Application Layer Cleanup](#application-layer-cleanup)
- [Deployment Automation](#deployment-automation)
- [Distribution Strategy](#distribution-strategy)
- [What Diverged From The Plan](#what-diverged-from-the-plan)
- [The Cost Impact](#the-cost-impact)
- [What Comes Next](#what-comes-next)

---

## What Happened Between Planning and Execution

The plan in Part 1 was clean: move the infrastructure, tighten the security posture, build automation.

What actually happened was messier. The infrastructure piece came together exactly as designed. But halfway through, it became clear the application layer itself had accumulated debt that couldn't be worked around. Thirteen separate service binaries, each managing its own network client. Configuration written without proper access controls. Command stubs that had never been completed. URL construction that lacked input validation.

These aren't showstoppers. They work. But a platform with 500 users running in production cannot be "works." It has to be "verified and understood."

So the execution involved two parallel tracks: fix the infrastructure, and fix the application. Both happened. Both took longer than expected. Both were necessary.

## The Architecture That Emerged

The infrastructure pattern that came out is simple:

```
Cloud Provider (DNS, DDoS, edge caching)
        ↓
Zero-Trust Tunnel (encrypted, outbound-only)
        ↓
Dedicated Server (SSH-only inbound, firewall)
        ↓
Container Orchestration (Postgres, Redis, services)
        ↓
External Services (managed databases, cache)
```

No public IPs in DNS. No open inbound ports except SSH with key-based auth. All traffic encrypted. All infrastructure as code.

The server is ARM-based, deployed in a region chosen for reliability and cost. Docker Compose manages six services on a private network: the API, cache layer, workflow engine, and the tunnel client that dials out to the CDN provider and holds the connection open.

The tunnel client is the interesting bit. The server never initiates inbound connections. Instead, it dials out and holds a persistent encrypted channel. The CDN provider routes all public requests back through that channel. The server never needs to be reachable from the internet. It only needs to reach the internet.

This is defensible infrastructure. The blast radius of a compromise on the server is limited by the firewall. The blast radius of a DNS hijack is limited because the server was never in DNS. The blast radius of a DDoS is zero because the CDN absorbs it before any traffic reaches the server.

## Application Layer Cleanup

The bigger surprise was the application work.

The CLI had thirteen separate command implementations, each managing its own HTTP client. No shared auth logic, no consistent timeout handling, no unified error response format.

The fix was a small package that became the single source of truth for all network communication:

```go
type Client struct {
  registry string
  token    string
  auth     AuthMode
  timeout  time.Duration
}
```

Migrate thirteen implementations to use the shared client. One timeout strategy. One authentication flow. One place to change if the API contract shifts.

The config file was stored without access controls. On a shared system, anyone on the machine could read the auth token. Changed the file permissions during write to ensure only the owning user can read it.

There were command stubs—placeholders for features not yet built, printing "coming soon" to the user. These got removed entirely. The CLI now exports twenty-six production commands. No placeholders. No aspirational features masquerading as working code.

URL construction lacked escaping. User-supplied identifiers went directly into paths. Added proper input validation across all service calls.

## Deployment Automation

The infrastructure can be deployed from code. The applications should be deployable from code too.

Set up an automated pipeline: push code, run tests, if tests pass, build, if build succeeds, deploy, if deploy succeeds, verify health.

The pipeline has three phases:

**Test**: Run the full suite. Backend tests, CLI tests, end-to-end tests. If any fail, stop.

**Build**: Cross-compile the application for multiple platforms and architectures. Package into archives.

**Deploy**: Push the binary to the server, restart the service, health-check the endpoint. If health check fails, rollback.

All of this is declarative. A single configuration file describes the entire flow. Push code → automatic pipeline → live.

The alternative is to manually SSH somewhere and restart services. Or to have a half-dozen slack commands that trigger deploys. Or to hope you remember to restart after an update. All of those are human-error prone and impossible to audit.

## Distribution Strategy

Users install the application via a single command: pipe a shell script to bash.

The script needs to be available everywhere, fast. Serving it from your own infrastructure adds latency and operational burden.

Instead, host it at the CDN edge. When a user runs the install command, the script is fetched from a global network, cached locally, and returned in milliseconds. The script itself never changes—it's part of your release artifacts. The distribution layer doesn't need to be intelligent.

## What Diverged From The Plan

The original plan assumed the infrastructure migration and the application cleanup were separate concerns. They weren't. The application code was tied to how the infrastructure was deployed. The configuration needed to know where to find the infrastructure. The deployment scripts needed to know how the application was built.

So the work expanded: infrastructure, application, deployment, distribution, all moved together.

The plan also assumed infrastructure-as-code would be straightforward. It was. But maintaining it alongside three other services meant standardizing patterns across all of them so they didn't diverge over time. That wasn't in the original scope, but it was necessary.

## The Cost Impact

Before: significant monthly cost for managed infrastructure with limited control and unclear billing.

After: cost proportionate to actual resource usage, transparent, reproducible, and auditable.

The savings are real but not the focus. The focus is that you now own the entire stack. You know exactly what is running, how it is running, and what it costs. You can change providers. You can scale up or down. You can audit the entire flow from code change to production.

That is worth the time investment.

## What Comes Next

Part 1 was planning. Part 2 was execution. Part 3 will be standardization: taking the patterns that worked for Wardscribe and applying them across the other services.

Four Go services, different purposes, built at different times. They diverged. Bringing them to a common pattern—consistent logging, consistent configuration, consistent testing strategy, consistent deployment—means context-switching between them becomes natural instead of disorienting.

That is the remaining work.

---

*This is Part 2 of an ongoing series documenting a full infrastructure migration. Part 1 covered the plan. Part 3 will cover cross-service standardization.*
