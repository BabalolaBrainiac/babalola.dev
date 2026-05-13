# Building a Context Broker for LLM Sessions

**Published:** April 2026

**Tags:** #Go #LLM #CLI #TerminalTools #SQLite #PTY #ContextManagement #DeveloperTools #Compaction #TUI

## Table of Contents

- [The Problem I Got Tired Of](#the-problem-i-got-tired-of)
- [What is Meanas?](#what-is-meanas)
- [Architecture Overview](#architecture-overview)
- [Why Go](#why-go)
- [The Storage Decision: SQLite with WAL](#the-storage-decision-sqlite-with-wal)
- [PTY Capture: Why Not Pipes](#pty-capture-why-not-pipes)
- [IPC: Unix Sockets, flock, and UID Verification](#ipc-unix-sockets-flock-and-uid-verification)
- [Session Identity and a Design Mistake I Had to Fix](#session-identity-and-a-design-mistake-i-had-to-fix)
- [Compaction: Keeping Context Without Keeping Everything](#compaction-keeping-context-without-keeping-everything)
- [The TUI](#the-tui)
- [Lessons Learned](#lessons-learned)
- [Conclusion](#conclusion)

---

## The Problem I Got Tired Of

I had a Claude session going. We had been working through a complex database migration together for about 45 minutes. The schema, the edge cases, the exact ordering of steps that would not cause downtime. It was good work. Then Claude started drifting. The suggestions got less precise. I hit the context ceiling.

So I opened Gemini. And then I typed the most demoralizing sentence in modern engineering: "Let me give you some context."

The next ten minutes were me explaining what we had already figured out. The schema. The constraints. The things we tried that did not work. I was not writing code. I was narrating a conversation that had already happened to a model that had not been there for it.

This happens constantly. You switch providers because you want a second opinion. Because one model handles code generation better and another handles architectural reasoning better. Because you want to compare outputs. Every single time, you start from zero or you paste a massive context block and hope the model processes it correctly instead of just acknowledging it and moving on.

I got tired of it. I built meanas.

The name comes from the Malazan Book of the Fallen. Meanas is the Warren of Shadow, a realm of concealment and misdirection, operating beneath the surface of the visible world. The same idea applies here: meanas runs silently in the background, watching your LLM sessions, capturing everything, surfacing nothing until you need it. It lives in shadow until you ask it to act.

## What is Meanas?

Meanas is a Go CLI tool that acts as a context broker for LLM terminal sessions. It attaches to your running provider sessions (Claude, Gemini, Kimi, GPT), captures the full conversation as it happens, compresses and stores it locally, and gives you a clean migration path to hand that context to a different provider without reprompting.

Here is what it actually does:

**Passive Capture**: A background daemon watches active provider sessions via PTY. You never change your workflow. You run `claude` or `gemini` the same way you always have.

**Local-First Storage**: Everything goes into a local SQLite database. No cloud, no network calls, no third-party service touching your conversations.

**Compaction**: Sessions accumulate chunks over time. Meanas compresses older context using a sliding window compactor, keeping recent exchanges verbatim and summarizing older ones.

**Migration**: When you want to move a session to a different provider, meanas assembles the full compacted context into a structured document and injects it into the new session as its first message. The new provider picks up where the old one left off.

**TUI**: A Bubbletea-powered terminal dashboard shows all your sessions, their sizes, token estimates, and lets you compact, delete, export, or inspect any session.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        meanas                                    │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────────┐  │
│  │  Shell Hook  │   │  Background      │   │  TUI             │  │
│  │  (init)      │   │  Daemon          │   │  (Bubbletea)     │  │
│  └──────┬───────┘   └────────┬────────┘   └────────┬─────────┘  │
│         │                    │                     │             │
│         │   Unix Socket IPC  │                     │             │
│         └────────────────────┼─────────────────────┘            │
│                              ▼                                   │
│                   ┌─────────────────┐                            │
│                   │  SQLite Store   │                            │
│                   │  (WAL mode)     │                            │
│                   └─────────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
```

**Shell Hook**: `meanas init` installs shell functions that intercept provider invocations, wrapping the real binary with PTY capture.

**Background Daemon**: Owns all store writes, manages active session watchers, handles compaction, enforces session limits.

**TUI**: A Bubbletea terminal UI that reads from the store and communicates with the daemon over the Unix socket.

**SQLite Store**: Single WAL-mode database file at `~/.local/share/meanas/sessions.db`. Sessions, chunks, and compacted summaries all live here.

## Why Go

The decision to write meanas in Go was straightforward once I thought through the requirements.

The daemon needs to run continuously in the background with minimal memory overhead. It needs to handle multiple concurrent PTY sessions without burning CPU. It needs to ship as a single binary that users can install without a runtime. Python would have worked for a prototype, but the overhead of a Python interpreter sitting idle in the background, plus the packaging complexity, made it a non-starter.

Node felt wrong for the same reasons, plus I wanted the concurrency model to be explicit. With Go, goroutines are cheap enough that each active session can have its own read loop without any meaningful overhead. At 10 sessions, you are looking at roughly 40 KB of goroutine stack. That is not a rounding error.

The standard library coverage mattered too. `syscall.Flock` for PID file locking. `net.Listen("unix", ...)` for the socket. `crypto/sha256` and `encoding/binary` for the wire protocol. `os.Executable()` for fork-execing the daemon. Go's stdlib handles all of this cleanly without pulling in a dependency forest.

## The Storage Decision: SQLite with WAL

I considered a few options:

- A simple flat file or directory of text files per session
- BoltDB or Badger for an embedded key-value store
- SQLite

Flat files were appealing for simplicity but became complicated as soon as I needed to query across sessions, sort by recency, or implement efficient chunk retrieval. Directory listings are not a query language.

BoltDB gave me transactions and ACID guarantees, but the query model is key-value. Anything involving listing sessions ordered by `updated_at`, filtering by provider, or joining session metadata with chunk counts meant I was going to implement my own secondary indexes on top of a bucket store. That is reinventing a bad version of SQLite.

SQLite in WAL mode hit every requirement:

```go
pragmas := []string{
    "PRAGMA journal_mode=WAL",
    "PRAGMA foreign_keys=ON",
    "PRAGMA busy_timeout=5000",
    "PRAGMA secure_delete=ON",
}
```

WAL mode allows concurrent readers while a write is in progress. The TUI can list sessions while the daemon is appending chunks without either blocking the other. `busy_timeout=5000` means write contention from multiple connections results in a retry, not an immediate error. `secure_delete=ON` overwrites deleted rows with zeros, which matters when you are storing raw conversation data.

The schema is straightforward: a `sessions` table holds metadata, a `chunks` table holds PTY output compressed with zstd:

```go
const MaxChunkSize = 4 << 20       // 4 MiB raw
const MaxDecompressSize = 64 << 20 // 64 MiB decompressed bound
```

Each chunk is individually zstd-compressed at level 3 before insertion. Terminal output compresses extremely well. Raw PTY data that would be 500 KB uncompressed typically lands around 80-120 KB. For a session with 50 chunks you are storing megabytes of conversation in a few hundred KB on disk.

The encoder pool avoids allocation churn on every write:

```go
encPool := &sync.Pool{
    New: func() interface{} {
        buf := &bytes.Buffer{}
        enc, _ := zstd.NewWriter(buf, zstd.WithEncoderLevel(
            zstd.EncoderLevelFromZstd(3)))
        return &encoderWrapper{enc: enc, buf: buf}
    },
}
```

## PTY Capture: Why Not Pipes

When I first thought about capturing LLM session output, pipes seemed obvious. Redirect stdout and stderr. Read from the pipe. Store the bytes.

The problem is that pipes break the interactive experience. Modern LLM CLI tools like Claude Code and Gemini use terminal control sequences heavily. Color codes, cursor movement, progress spinners, line clearing. They detect whether they are running in a TTY and change their behavior if they are not. Pipe stderr and stdout and you either get a degraded experience or you get a binary mess of escape sequences that does not represent what the user actually saw.

PTY (pseudoterminal) is the right primitive here. You create a master-slave PTY pair. The provider binary runs with the slave as its terminal. You read from the master. The binary thinks it is attached to a real terminal and behaves normally. The user gets the full interactive experience. You get a complete capture.

```go
ptmx, pts, err := pty.Open()  // creack/pty
// ...
cmd.Stdin = pts
cmd.Stdout = pts
cmd.Stderr = pts
cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
cmd.Start()
pts.Close() // close slave in parent after child inherits it
```

Reading from the master gives you exactly what the terminal displays. The read loop uses `SetReadDeadline` to enable periodic checks on the stop channel without blocking indefinitely:

```go
_ = ptmx.SetReadDeadline(time.Now().Add(50 * time.Millisecond))
n, err := ptmx.Read(buf)
if errors.Is(err, os.ErrDeadlineExceeded) {
    // normal: check stopCh and flush pending data if idle
    continue
}
```

Data accumulates in a pending buffer. A flush happens when either 64 KB accumulates or 200 ms pass without new data. This Nagle-like batching avoids writing a database transaction for every individual keystroke.

## IPC: Unix Sockets, flock, and UID Verification

The daemon and CLI communicate over a Unix domain socket placed in the XDG runtime directory (`$XDG_RUNTIME_DIR/meanas/` or `~/.local/run/meanas/`). The socket is created with `0600` permissions.

```go
listener, err := net.Listen("unix", d.socketPath)
os.Chmod(d.socketPath, 0600)
```

`0600` means only the owning user can connect. But permissions alone are not enough because `root` can bypass them. On every accepted connection, meanas calls `getsockopt(SO_PEERCRED)` to read the connecting process's UID and verifies it matches the daemon's UID. A root process trying to impersonate a user session is rejected at the connection level.

The PID file uses `flock` for mutual exclusion, not the write-then-check pattern that has a race condition:

```go
fd, _ := os.OpenFile(d.pidPath, os.O_CREATE|os.O_RDWR, 0600)
syscall.Flock(int(fd.Fd()), syscall.LOCK_EX|syscall.LOCK_NB)
```

`LOCK_NB` means the flock call returns immediately with `EWOULDBLOCK` if another instance already holds the lock. No sleep-and-retry, no PID existence checks with their TOCTOU races. Either you get the lock or you exit.

The wire protocol is minimal: a 1-byte message type, a 4-byte little-endian payload length, and a JSON payload. The response uses the same framing with a 1-byte status prefix (0x00 success, 0xFF error). No protobuf, no gRPC, no HTTP overhead. The daemon handles each connection in its own goroutine, which is cheap given that IPC calls are infrequent and short-lived.

## Session Identity and a Design Mistake I Had to Fix

The original session ID design seemed obvious: hash the project directory.

```go
func SessionID(absPath string) (string, error) {
    hash := sha1.Sum([]byte(absPath))
    return hex.EncodeToString(hash[:]), nil
}
```

One directory, one session. Clean. Simple. Wrong.

The problem became clear when I had two Claude sessions running in the same project directory. They were the same session ID. One overwrote the other in the store. The watcher registry, keyed by session ID, could only hold one watcher per ID. The second Claude session was invisible.

But even for sessions in different directories, the `FindProviderPID` function stopped at the first match. It was not scanning for all instances, just finding one.

The fix is in progress: session IDs are moving to UUID v4, assigned at process-launch time by the daemon. A session is a provider process instance, not a directory. The daemon issues a new UUID on every `SessionBegin` call, regardless of which directory the session is running in.

```go
// v2: session_id = uuid4(), assigned at SessionBegin
// Two Claude sessions in the same directory = two independent UUIDs
```

The PID gets stored alongside the UUID so a background reaper can identify orphaned sessions (processes that died without a clean `SessionEnd`) and free their slot in the active session count.

This is the kind of design mistake that looks obviously correct when you are thinking about the single-session case and breaks visibly the moment someone runs two terminals at once. I shipped the wrong version, caught it, and the fix is in the next release.

## Compaction: Keeping Context Without Keeping Everything

PTY sessions accumulate data fast. An active Claude session over an hour might generate 10-20 MB of raw terminal output. Storing that verbatim forever is not viable, but discarding it means losing context.

The compaction model uses a sliding window: keep the most recent N chunks verbatim, summarize everything older into a single text blob. The summarized blob is stored on the oldest retained chunk as a `summary` column value. Subsequent reads reconstruct the full context as: summary header + recent verbatim chunks.

```go
func (c *SlidingWindowCompactor) Compact(chunks []store.Chunk, windowSize int) (string, error) {
    if len(chunks) <= windowSize {
        return "", nil // nothing to compact
    }
    olderCount := len(chunks) - windowSize
    older := chunks[:olderCount]

    var b strings.Builder
    b.WriteString("--- Context Summary (Compacted) ---\n")
    for _, chunk := range older {
        if b.Len() >= MaxSummaryBytes {
            break
        }
        b.Write(chunk.Raw)
        b.WriteByte('\n')
    }
    // ...
}
```

The v1 compactor is extractive: it concatenates the older chunks into a summary, capped at 32 KB. This is deterministic, has zero external dependencies, and runs in microseconds. The summary is not LLM-generated yet. That is a v2 feature. For now, the goal is keeping the store from growing without bound while preserving enough context for migrations.

Auto-compaction is triggered via a callback wired into the store's `AfterAppend` hook. Every time a chunk is written, the daemon checks if the session has exceeded the configured token threshold. If it has, compaction runs in a separate goroutine so it never blocks the PTY read loop.

```go
d.store.SetAfterAppend(func(sessionID string) {
    go func() {
        sess, _ := d.store.GetSession(sessionID)
        compactor.AutoCompact(d.store, sess, cfg.MaxChunks, cfg.CompactThreshold)
    }()
})
```

The default threshold is 8,000 tokens (approximately 32 KB of raw data). When sessions hit that mark, the 50 most recent chunks are kept verbatim and everything older gets rolled into the summary. The numbers are configurable via `meanas config set compact-threshold`.

## The TUI

The TUI is built with Charmbracelet's Bubbletea framework. The model-update-view pattern fits well for a dashboard that needs to respond to keyboard input, async IPC calls, and periodic data refreshes without the complexity of manual state threading.

The current session list is a flat table. Sessions show their short ID, provider, project path, estimated tokens, chunk count, and age. You can navigate with arrow keys, open a detail view on enter, trigger compaction with `c`, delete with `d`, and export with `e`.

The upcoming v2 TUI groups sessions by provider with live status indicators, adds a migration wizard triggered by `m`, and introduces a 5-second tick for real-time refresh from the daemon rather than requiring manual `r` keypresses.

```
 meanas                                        daemon ● live  q quit
 ────────────────────────────────────────────────────────────────────
 [1] Sessions  │  CLAUDE  (2 active)
 [2] Status    │  ► 7a3f21e4  ~/projects/meanas  active  12.3K  2m
 [3] Config    │    b8c04a12  ~/projects/webapp   active   8.1K  5m
               │
               │  GEMINI  (1 active)
               │  ► f3d91bc0  ~/projects/api      active   4.2K  1m
               │
               │  ↑/↓ navigate  enter detail  m migrate  d delete
```

Design-wise, the palette is intentionally minimal: near-black background (`#050505`), orange accent (`#E85D04`), off-white text (`#F0EDE6`), and Geist Mono as the font assumption. It should feel like a tool that belongs in a terminal, not a web app that happens to render in one.

## Lessons Learned

**The right abstraction for IPC matters more than the protocol.** I briefly considered HTTP for the daemon because it would make the TUI and CLI code simpler to write. HTTP has connection overhead, header parsing, and keepalive complexity that is just noise for a local daemon. A Unix socket with a 5-byte header is faster, simpler, and easier to reason about under failure conditions.

**PTY is the right primitive but test it carefully.** The PTY read loop has a lot of edge cases: `os.ErrDeadlineExceeded` vs real I/O errors, the "bad file descriptor" error that happens when the process exits, the `SIGHUP` behavior when the controlling terminal closes. The integration tests for this required careful mocking of `pty.Open` to simulate these failure modes.

**Do not key state on things that change meaning.** The `sha1(path)` session ID seemed like a good idea until it was not. A session is an instance of a process. That is the thing to identify. A directory is where the process happens to be running. Conflating the two worked for the single-session case and broke for everything else. Session identity in v2 is UUID at process birth, and that is the right model.

**Compression ratios for terminal output are surprisingly good.** zstd at level 3 consistently achieves 5-8x compression on PTY data. The investment in a pooled encoder, careful buffer management, and bounded decompression windows paid off in both performance and security (the `MaxDecompressSize` constant prevents decompression bomb attacks on stored data).

**Auto-compaction needs to be fire-and-forget.** Any compaction that blocks a write path will eventually cause a stuck session. The `AfterAppend` goroutine pattern is correct: observe the write, decide asynchronously, never hold the caller.

**Bubbletea's model-update-view pattern is genuinely good for TUI tools.** The constraint of immutable state updates makes the TUI predictable under edge cases that would be awkward with direct mutation: what happens if a session is deleted while the detail view is open? The answer is mechanical: the next update cycle reconstructs state from the store, and the view reflects reality. No stale pointer, no inconsistent display.

## Conclusion

I built meanas to solve a specific, personal pain: the cost of switching providers mid-thought. Every time I had to re-explain a 45-minute conversation to a new model, I was paying a tax on having built something useful with the first one.

The tooling for working across multiple LLM providers is still immature. We have great clients for individual providers. We do not have good infrastructure for treating the context you build up as a portable asset that belongs to you and travels with you. Meanas is an attempt to build that infrastructure at the CLI layer, where developers actually work.

Meanas is going live soon. If you have ever typed "let me give you some context" to a model that should have already had it, this is the tool I am building for you.
