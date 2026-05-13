# The $66 Wake-Up Call: Migrating My Entire Stack (Part 1 - The Plan)

**Published:** April 2026

**Tags:** #Infrastructure #Cloudflare #Hetzner #Go #DevOps #Migration #Wardscribe #TanStackStart #SelfHosted #LearningInPublic #WardMind #Temporal

## Table of Contents

- [The Weekend That Started This](#the-weekend-that-started-this)
- [The Full Mess I Am In](#the-full-mess-i-am-in)
- [The Decisions](#the-decisions)
- [What I Am Learning Along The Way](#what-i-am-learning-along-the-way)
- [The Plan, Phase by Phase](#the-plan-phase-by-phase)
- [What Success Looks Like](#what-success-looks-like)
- [What Is Next](#what-is-next)

---

## The Weekend That Started This

Two things happened on the same weekend.

First, Vercel was hacked. I have a project called `vent.help` that I wrote a few years back, in between other things, during a period where I was moving fast and not enforcing the security standards I hold myself to now. I had not touched the codebase in a long time. When the Vercel breach happened it pushed me to go back and review it. I found live AWS IAM keys, an RDS password, a Redis auth token, and an encryption key sitting plaintext in a `vercel.json` file that was committed to git. Not in environment variables. Not in a secret manager. In a JSON file tracked by git, on a platform that had just been breached.

I am telling you this because it is the kind of thing that happens when you write something quickly between projects and never go back. I know better now, and the breach gave me the reason to clean it up properly.

Second, I got a bill for wardscribe. Sixty-six dollars.

Wardscribe is an agent platform I have been building. An agent registry where developers can publish, discover, and run AI agents in a structured format called wardpack. The platform has around 500 users at this point and is genuinely growing. The backend is a Go/Gin API with Temporal workflows handling durable execution, PostgreSQL with pgVector for semantic search across the agent registry, Redis for caching, and a custom inference cluster I call WardMind. WardMind is a set of fine-tuned models I trained on RTX 3090s via Vast.ai: a 0.6B router model that classifies intent and routes execution, a 1.5B classifier for task complexity scoring, and an 8B architect model that handles wardpack generation and planning. The inference cluster runs on Vast.ai GPU instances, exposed to the backend through Cloudflare Tunnel, so the Go API can hit `wardmind-router.wardscribe.io` and get a response from a model running on a GPU in a data centre somewhere without the instance IP ever being in DNS.

The bill made sense when I looked at it. Two `performance-2x` Fly.io machines, 4GB each, minimum two always running. That is sixty dollars in compute alone, before Temporal Cloud, before anything else. The infrastructure was sized as though I was running something at serious production scale. For a platform with 500 users it is overbuilt. The fix is not just downscaling, though. I have been meaning to rethink the entire setup for a while and this was the nudge I needed.

Both things in the same weekend pointed at the same pattern: infrastructure I had set up without revisiting, accumulated technical debt on the ops side. I had actually spent the week before doing a significant cleanup: centralising all my Cloudflare resources into a proper Terraform setup, building reusable modules for DNS, R2, KV, D1, Workers, WAF, creating per-project directories, scripting the full plan/validate/deploy pipeline with checkov and tflint gates. Everything that was fragmented and managed ad hoc across individual projects now lives in one place with a proper structure. That cleanup made the problem more visible, not less. My compute infrastructure had not gotten the same treatment.

So I decided to fix it. All of it. At once.

## The Full Mess I Am In

Before I describe the plan, you need to understand the scale of the problem. I have a lot of projects.

Across my workspace I have around fourteen active projects. Six of them are deployed on Vercel. Four of them have Go backends. A handful use Cloudflare Workers. Almost all of them talk to Supabase. Several have their own databases. A few share no infrastructure at all.

The Go backends specifically have been developed independently over time and have diverged in ways that make me uncomfortable. Wardscribe uses Gin, talks to Temporal, runs pgVector queries, and manages a distributed inference pipeline. Other services use Cobra and Squirrel for a different problem entirely, or Bubbletea for terminal interfaces. They share a language and roughly similar patterns but have no enforced standard for error handling, configuration, logging, or testing structure.

The Next.js apps are all on slightly different versions, fetching data in entirely different ways, none of them using TanStack Start. I have been meaning to change that for a while and Twitter finally made it click. TanStack Start has gotten to a point where it is worth seriously experimenting with as a Next.js replacement, and I have enough apps that doing a proper comparison across a few of them will tell me something real rather than just reproducing what the docs say.

When I sat down to think about what actually needed to happen, it broke into four distinct problems:

**The security emergency.** Rotating credentials across everything after the Vercel breach. Fixing the vent.help situation immediately. Auditing git history with azath, a secret-scanning CLI I built myself ([azath.sh](https://azath.sh)).

**The wardscribe cost problem.** Getting from $66 a month to something proportionate for a 500-user platform that is still in its growth phase.

**The frontend migration.** Porting at least a few of my Next.js apps to TanStack Start and seeing whether it earns its place.

**The Go backend standardisation.** Bringing all my Go services to a common structure so I am not re-learning each codebase every time I context-switch.

Those became the four phases of a migration plan I put together over the weekend. I will share the full plan across this series as I work through it.

## The Decisions

The interesting part is not the plan itself. It is the decisions that shaped it.

### Why not keep everything on Fly.io and just downscale

The obvious fix is to drop from `performance-2x` to `shared-cpu-1x` and set minimum machines to zero. That gets the bill under ten dollars.

I am not doing that because I do not want to continue depending on Fly.io for my Go backends. Fly abstracts away things I want direct control over. I want to know exactly what is running, exactly how it is managed, and exactly what it costs. I have built similar infrastructure at several previous companies, I understand the operational model, and I would rather own it directly than rent an abstraction on top of it.

### Why Hetzner

Cheap, reliable, ARM instances that behave well under Go workloads. A CAX11 in Nuremberg is €3.79 a month for 2 ARM vCPUs and 4GB of RAM. Go binaries are lean at idle and I have done this math before, professionally. A box like this handles six to eight small Go services without meaningful resource pressure. That is not hope; it is arithmetic.

I looked at Oracle Cloud free tier, which is a genuinely compelling offer: four ARM cores and 24GB of RAM for nothing. I might use it at some point. For now I want to be paying for what I run. Free tiers are structurally unstable. Neon has a good product but they have already revised their free tier thresholds once, and the model of building operational dependencies on services that may reprice or disappear is one I have stepped away from. Paying €3.79 a month means the terms are straightforward.

### Why Cloudflare Tunnel for API routing

There are two distinct things in wardscribe's network topology that are easy to conflate but solve different problems.

The WardMind inference cluster is not publicly reachable and never should be. The backend reaches it over an SSH tunnel: the Go server opens an outbound SSH connection to the GPU instance, port-forwards to the inference process which is binding on loopback only, and all model traffic stays on that encrypted private channel. AES-256 in transit, no open inbound ports on the GPU instance, the only attack surface is the SSH key on the backend server. This is a standard pattern, it is secure, and it means there is no DNS record, no public URL, and no way for anything outside the backend to reach the inference layer. That is the correct design. Internal services should be internal.

Cloudflare Tunnel for the API is a different problem entirely. The API needs to be reachable from the internet. Instead of pointing a DNS record at the server IP, the Hetzner box dials out to Cloudflare and holds that connection open. All inbound traffic flows back through it. The server IP is never in DNS, the firewall drops everything except SSH, and I get Cloudflare's network in front of the API for free. Same zero-exposure principle as the inference setup, just applied to a service that needs to be publicly accessible.

### Why keep the Go backend as Go instead of rewriting to TypeScript or Rust

I thought about this seriously. Rewriting to Cloudflare Workers using Hono was a realistic option. Rust with Workers was another. Either would have moved the API to the edge and eliminated the compute cost entirely.

But Go is not the problem. The wardscribe backend has 23 test suites with coverage gates, a well-structured routing layer, proper middleware, and a codebase I can navigate in my sleep. The cost problem is infrastructure choice. Rewriting a working, tested backend to save forty dollars a month on a platform with 500 users is the wrong trade. The language stays. The hosting changes.

### Why self-host Temporal instead of replacing it

Temporal Cloud has a real cost. The `temporalio/auto-setup` Docker image runs a complete Temporal server backed by Postgres. I already have Postgres on the box. The only change is one environment variable.

Temporal is not trivial software to operate. I am not pretending otherwise. But at wardscribe's current scale, if Temporal goes down, workflows pause. That is acceptable. The operational risk is proportionate to what the platform is right now.

### Why TanStack Start and not just staying on Next.js

This is the most experimental part of the plan and I am being honest about that. TanStack Start is a full-stack React framework that uses file-based routing, type-safe server functions, and an architecture that feels meaningfully different from the Next.js model. Twitter has been loud about it for a few months and I want to form my own opinion rather than proxy someone else's.

I am not migrating every app. I am picking two or three and doing a proper port. If it earns its place I will migrate more. If it does not I will have a real answer instead of a hot take.

### On validation gates

The original plan used Claude Code as the validator at each checkpoint in the migration. I am going to replace that with a small service I am building specifically for this. A validator that runs the appropriate checks for each gate automatically: health endpoint probes, row count comparisons, test suite runs, config syntax validation. The output gets piped somewhere I can read it. Claude stays in the picture as a final checkpoint for anything the automated validator cannot catch, but I want the mechanical verification to be mechanical, not conversational.

Handoffs between tools throughout this process are managed by meanas, a context broker I built for LLM terminal sessions. Meanas attaches to your running provider sessions via PTY, captures conversations as they happen, compresses them locally, and gives you a clean way to hand context from one provider to another without reprompting. I use it to move context between Claude, Gemini, and Kimi depending on what I am working on. It is not public yet but it will be soon.

## What I Am Learning Along The Way

Part of the reason I am writing this as a series is that even with prior experience across similar infrastructure, some of the specific tools I am using here are new to me in this context. Caddy is one. I have used nginx and Traefik. I have not used Caddy seriously. The configuration model is simpler and the automatic TLS provisioning removes a category of operational work I am used to doing manually. Setting up reverse proxy routing for multiple Go services on one box is going to be my first real encounter with it.

systemd service management at depth is another. I know the basics. Getting zero-downtime binary swaps right, understanding socket activation, managing environment injection cleanly, these are things I want to get right rather than cargo-cult from a Stack Overflow answer.

I am going to document all of it. What worked immediately. What did not. What I would have done differently.

## The Plan, Phase by Phase

I will share the full plan across this series. Here is the structure.

**Phase 0: Security emergency.** Already in progress. Rotating all Vercel project secrets after the breach. Cleaning up the vent.help situation. Purging history with azath ([azath.sh](https://azath.sh)), a secret-scanning CLI I built and use across all my projects. This does not wait.

**Phase 1: Wardscribe infrastructure migration.** Provision a Hetzner CAX11. Install Docker, Caddy, cloudflared. Stand up Postgres 15 with pgVector, Redis 7, and self-hosted Temporal as Docker containers on the same box. Cross-compile the wardscribe Go binary for `linux/arm64`, deploy as a systemd service. Configure Caddy. Set up Cloudflare Tunnel for `api.wardscribe.io`. Migrate the database from Fly.io, verify row counts, run the full 23-suite test suite against the new endpoint, then cut over. Decommission Fly.io and Temporal Cloud. End state: $66/month becomes approximately €4/month.

**Phase 2: Frontend migration.** Pick two or three of my Next.js apps and port them to TanStack Start. Document what the migration actually involves in practice, not in theory.

**Phase 3: Go backend standardisation.** Bring all Go services to a common structure: sqlc for type-safe queries, Wire for dependency injection, slog for structured logging, typed config, testcontainers replacing sqlmock in integration tests.

The plan has validation checkpoints at each meaningful stage. I am building a small validator service to run the mechanical checks automatically. Claude stays as a final sanity pass on anything the automated validation cannot cover.

## What Success Looks Like

When this is done:

Wardscribe runs on infrastructure proportionate to what it actually is right now, with room to grow without a billing surprise. Every secret across every project has been rotated. I have a first real opinion on TanStack Start formed from actually building with it rather than reading about it. My Go backends share enough structure that I can context-switch between them without re-learning each one. The Cloudflare Tunnel and Hetzner setup I build for wardscribe becomes the template for everything else I build going forward.

And somewhere in here meanas gets public, which has been on the list for too long.

## What Is Next

Phase 0 is happening now. The credential rotation and git history cleanup are not interesting enough to write about in detail but they are necessary before anything else starts.

Part 2 covers provisioning the Hetzner box, the Docker compose stack, and the first real Caddy configuration. If something breaks in an interesting way, that is going in too.

---

*This is Part 1 of an ongoing series documenting a full infrastructure migration. Part 2 covers the Hetzner setup and first deployment.*
