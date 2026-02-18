# Forging Azath.sh: Breaking the Chains of Secret Leaks

**Published:** February 2026

**Tags:** #Security #Go #LLM #SecretScanner #AI #DevOps #Git #CredentialProtection #MachineLearning #EnterpriseSecurity

## Table of Contents

- [The Challenge](#the-challenge)
- [What is Azath.sh?](#what-is-azathsh)
- [Architecture Overview](#architecture-overview)
- [The Pattern Detection Engine](#the-pattern-detection-engine)
- [LLM Architecture for Context-Aware Detection](#llm-architecture-for-context-aware-detection)
- [Model Training Pipeline](#model-training-pipeline)
- [Security Credentials Management](#security-credentials-management)
- [Enterprise Features](#enterprise-features)
- [Performance Optimization](#performance-optimization)
- [Lessons Learned](#lessons-learned)
- [Conclusion](#conclusion)

## The Challenge

<a id="the-challenge"></a>

Secret leaks are every security engineer's nightmare. I've seen API keys in GitHub repos, database passwords in Slack threads, and JWT tokens committed directly to main. The existing tools? They catch maybe 60% of the obvious stuff—the AWS keys with their predictable prefixes, the GitHub tokens with `ghp_` signatures. But the subtle ones? The custom internal tokens, the obfuscated credentials, the secrets buried in minified code? Those slip through.

I wanted to build something that actually understands context. Not just regex matching, but genuine semantic understanding of what constitutes a secret in different contexts. Something fast enough to run on every commit without making developers wait. Something that learns from your organization's specific patterns.

That's how azath.sh was born. The name comes from the Malazan Book of the Fallen—the Azath are mysterious houses that bind and imprison the most powerful and chaotic entities. They are the house of chains, literally chaining down what would otherwise wreak havoc. In the same spirit, azath.sh binds and secures the chaotic sprawl of secrets that threaten to escape into the wild. We are all, in a sense, from the house of chains—chaining down credentials, locking away tokens, binding what should not roam free.

## What is Azath.sh?

<a id="what-is-azathsh"></a>

Azath.sh is a blazing-fast, AI-powered secret scanner written in Go. It protects API keys, tokens, and credentials from leaking into git repositories. But calling it just a "secret scanner" undersells it significantly.

Here's what makes it different:

**Hybrid Detection**: Combines 100+ regex patterns with an LLM-based classifier for context-aware detection
**Sub-Second Scanning**: Processes entire repositories in under a second, even for large codebases
**False Positive Reduction**: The LLM component understands context, dramatically reducing false positives compared to regex-only tools
**Enterprise-Ready**: SSO integration, audit logging, compliance reporting, and team-wide policy enforcement

You can check out the codebase at [github.com/azathsh/azath](https://github.com/azathsh/azath).

## Architecture Overview

<a id="architecture-overview"></a>

Azath is built as a modular system with three core components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Azath.sh                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Scanner    │  │   Analyzer   │  │   LLM Engine     │  │
│  │   Engine     │  │   (Rules)    │  │   (Classifier)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│         └─────────────────┼───────────────────┘             │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │  Result Aggregator                      │
│                  └────────┬────────┘                        │
│                           ▼                                 │
│                  ┌─────────────────┐                        │
│                  │  Output/Report  │                        │
│                  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Scanner Engine**: Walks the filesystem, identifies files to scan, handles git integration for pre-commit hooks
**Analyzer**: Pattern matching engine with 100+ built-in rules for common secret types
**LLM Engine**: Contextual classifier that scores potential secrets based on surrounding code context
**Result Aggregator**: Deduplicates findings, calculates confidence scores, formats output

## The Pattern Detection Engine

<a id="the-pattern-detection-engine"></a>

The foundation of Azath is its pattern detection engine. I started with the obvious ones—AWS keys, GitHub tokens, Slack webhooks—but quickly realized that every organization has custom secrets. Internal API keys, proprietary token formats, environment-specific credentials.

Here's how the rule engine works:

```go
type Pattern struct {
    Name        string
    ID          string
    Regex       *regexp.Regexp
    Entropy     float64
    Confidence  float64
    Keywords    []string
    Exclude     []*regexp.Regexp
}
```

Rules are loaded from YAML configuration files, allowing teams to add custom patterns without modifying code:

```yaml
patterns:
  - name: "AWS Access Key ID"
    id: "aws-access-key-id"
    regex: "AKIA[0-9A-Z]{16}"
    entropy: 3.5
    confidence: 0.9
    keywords: ["aws", "amazon", "access", "key"]
    
  - name: "AWS Secret Access Key"
    id: "aws-secret-access-key"
    regex: "[0-9a-zA-Z/+]{40}"
    entropy: 4.5
    confidence: 0.7
    keywords: ["secret", "aws", "credentials"]
    exclude: ["^example$", "^test$"]
```

The entropy calculation is crucial. Random-looking strings have high entropy. This helps distinguish real secrets from placeholder values like `YOUR_API_KEY_HERE`.

```go
func calculateEntropy(s string) float64 {
    if len(s) == 0 {
        return 0
    }
    
    freq := make(map[rune]float64)
    for _, r := range s {
        freq[r]++
    }
    
    var entropy float64
    length := float64(len(s))
    for _, count := range freq {
        p := count / length
        entropy -= p * math.Log2(p)
    }
    
    return entropy
}
```

## LLM Architecture for Context-Aware Detection

<a id="llm-architecture-for-context-aware-detection"></a>

Here's where it gets interesting. Regex and entropy catch obvious secrets, but they miss contextual nuance. Is that string a secret, or is it a legitimate identifier? Is it in a test file (probably fine) or a config file (dangerous)?

Azath uses a lightweight LLM classifier for this. I didn't want to ship a 7B parameter model—that would defeat the purpose of a fast CLI tool. Instead, I fine-tuned a smaller model specifically for secret detection.

### Model Selection

After experimenting with several options, I settled on a fine-tuned version of `all-MiniLM-L6-v2` (384 dimensions, 22M parameters). It's small enough to run locally without GPU acceleration, but powerful enough to understand code context.

Why this model?
- **Speed**: Inference in <50ms per candidate on CPU
- **Context Window**: 512 tokens—enough for surrounding code context
- **Embedding Quality**: Good semantic understanding of code patterns

### The Classification Pipeline

When the scanner finds a potential secret, it extracts context and sends it to the classifier:

```go
type ClassificationInput struct {
    Candidate   string
    Line        string
    Surrounding []string
    FilePath    string
    FileType    string
}

type ClassificationResult struct {
    IsSecret    bool
    Confidence  float64
    SecretType  string
    Explanation string
}
```

The classifier looks at patterns like:
- Variable names (`api_key = "..."` vs `const API_KEY_EXAMPLE = "..."`)
- File context (`.env` vs `.test.js`)
- Surrounding code (is it in a `print` statement? a config loader?)
- String characteristics (length, character distribution)

### Integration Architecture

```go
type LLMClassifier struct {
    model     *onnxruntime.Model
    tokenizer *tokenizer.BPE
    threshold float64
}

func (c *LLMClassifier) Classify(ctx context.Context, input ClassificationInput) (*ClassificationResult, error) {
    tokens := c.tokenizer.Encode(formatInput(input))
    
    outputs, err := c.model.Run(ctx, tokens)
    if err != nil {
        return nil, fmt.Errorf("inference failed: %w", err)
    }
    
    confidence := sigmoid(outputs[0])
    isSecret := confidence > c.threshold
    
    return &ClassificationResult{
        IsSecret:   isSecret,
        Confidence: confidence,
        SecretType: classifyType(outputs[1:]),
    }, nil
}
```

## Model Training Pipeline

<a id="model-training-pipeline"></a>

Training a secret detection model required a specialized dataset. I couldn't just use existing NLP datasets—none of them had labeled secrets in code context.

### Dataset Construction

I built a synthetic dataset combining:

1. **Real Leaked Secrets**: From public GitHub commits (sanitized, rotated)
2. **Synthetic Secrets**: Generated secrets following real patterns
3. **Negative Examples**: Legitimate code that looks like secrets (hashes, UUIDs, etc.)
4. **Context Variations**: Same secrets in different contexts (tests, configs, source)

Final dataset composition:
- 50,000 positive examples (actual secrets with context)
- 150,000 negative examples (false positives, legitimate code)
- Context window: 5 lines surrounding the candidate

### Training Process

The model was fine-tuned using contrastive learning:

```python
for batch in dataloader:
    anchor_emb = model(batch.anchor)
    positive_emb = model(batch.positive)
    negative_emb = model(batch.negative)
    
    loss = contrastive_loss(anchor_emb, positive_emb, negative_emb)
    
    loss.backward()
    optimizer.step()
```

Training took ~4 hours on an A100, converging at 94% accuracy on the validation set.

### Continuous Learning

For enterprise deployments, Azath supports continuous learning from false positives. When a user marks a detection as a false positive, that example is added to a feedback queue. Weekly retraining incorporates these examples, improving accuracy over time.

```go
type FeedbackEntry struct {
    Input     ClassificationInput
    Corrected bool
    Timestamp time.Time
}

func (c *LLMClassifier) RecordFeedback(entry FeedbackEntry) error {
    return c.feedbackStore.Save(entry)
}
```

## Security Credentials Management

<a id="security-credentials-management"></a>

A secret scanner needs its own secrets—for API access, authentication, encryption. Managing these securely was critical.

### Key Management

Azath uses a hierarchical key system:

1. **Master Key**: Stored in the OS keychain (macOS Keychain, Windows DPAPI, Linux Secret Service)
2. **Data Encryption Key (DEK)**: Encrypted by the master key, used for encrypting stored credentials
3. **API Credentials**: Individual service credentials, encrypted with the DEK

```go
type KeyManager struct {
    masterKey []byte
    dek       []byte
}

func (km *KeyManager) GetCredential(service string) (string, error) {
    encrypted := km.store.Get(service)
    
    plaintext, err := decrypt(encrypted, km.dek)
    if err != nil {
        return "", fmt.Errorf("decryption failed: %w", err)
    }
    
    return string(plaintext), nil
}
```

### Enterprise SSO Integration

For enterprise deployments, Azath integrates with identity providers via SAML/OIDC:

```go
type SSOConfig struct {
    Provider     string
    ClientID     string
    ClientSecret string
    IssuerURL    string
    RedirectURL  string
}

func (s *Server) HandleSSOCallback(w http.ResponseWriter, r *http.Request) {
    user, err := s.sso.Verify(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    token, err := s.issueToken(user, 24*time.Hour)
    if err != nil {
        http.Error(w, "Token issuance failed", http.StatusInternalServerError)
        return
    }
    
    w.Write([]byte(token))
}
```

### Audit Logging

Every scan, every detection, every policy change is logged:

```go
type AuditEvent struct {
    Timestamp   time.Time
    UserID      string
    Action      string
    Repository  string
    CommitHash  string
    Details     map[string]interface{}
}

func (s *Server) LogEvent(event AuditEvent) {
    s.auditLog.Append(event)
    
    if s.siemClient != nil {
        s.siemClient.Send(event)
    }
}
```

## Enterprise Features

<a id="enterprise-features"></a>

Azath ships with enterprise-grade features that security teams need:

### Policy as Code

Security policies are defined in YAML and version-controlled:

```yaml
severity_threshold: high
rules:
  - id: block_production_keys
    condition: secret.type == "production" && context.environment == "commit"
    action: block
    message: "Production keys cannot be committed"
    
  - id: notify_security_team
    condition: severity == "critical"
    action: notify
    channels: ["security@company.com", "#security-alerts"]
    
  - id: auto_rotate
    condition: secret.type == "aws" && secret.confidence > 0.95
    action: rotate
    service: aws_secrets_manager
```

### Compliance Reporting

Built-in reports for SOC 2, PCI-DSS, and custom frameworks:

```go
report := &ComplianceReport{
    Framework: "SOC2",
    Period:    "2026-Q1",
    Metrics: map[string]int{
        "total_scans":        15420,
        "secrets_detected":   43,
        "false_positives":    7,
        "mean_time_to_fix":   3600,
    },
    Findings: []Finding{
        {
            Control:   "CC6.1",
            Status:    "compliant",
            Evidence:  "All repositories scanned within 24 hours",
        },
    },
}
```

## Performance Optimization

<a id="performance-optimization"></a>

Speed was a critical requirement. Developers won't use a tool that slows down their workflow.

### Parallel Processing

Azath uses goroutines for parallel file scanning:

```go
func (s *Scanner) ScanRepository(ctx context.Context, path string) (*ScanResult, error) {
    files := s.enumerator.ListFiles(path)
    
    var wg sync.WaitGroup
    results := make(chan FileResult, len(files))
    semaphore := make(chan struct{}, runtime.NumCPU()*2)
    
    for _, file := range files {
        wg.Add(1)
        go func(f File) {
            defer wg.Done()
            semaphore <- struct{}{}
            defer func() { <-semaphore }()
            
            result := s.scanFile(ctx, f)
            results <- result
        }(file)
    }
    
    go func() {
        wg.Wait()
        close(results)
    }()
    
    return s.aggregate(results), nil
}
```

### Incremental Scanning

Using git hooks, Azath only scans changed files:

```go
func (s *Scanner) ScanDiff(ctx context.Context, oldCommit, newCommit string) (*ScanResult, error) {
    changedFiles := s.git.Diff(oldCommit, newCommit)
    return s.scanFiles(ctx, changedFiles)
}
```

### Benchmarks

On a typical codebase (100k lines of code):
- Full scan: ~800ms
- Incremental scan (10 files): ~45ms
- Memory usage: ~50MB peak

## Lessons Learned

<a id="lessons-learned"></a>

**Context is Everything**: The biggest improvement in accuracy came from feeding surrounding code context to the LLM, not just the candidate string. A 16-character hex string in a test file is probably fine. The same string in an environment variable is a red flag.

**False Positives Kill Adoption**: Security tools that cry wolf get ignored. Investing in false positive reduction (the LLM classifier) was more important than catching 100% of secrets.

**Go's Concurrency Model is Perfect for This**: The combination of goroutines, channels, and the `context` package made building a responsive CLI tool straightforward. No callback hell, no thread management complexity.

**Model Size vs. Speed Trade-off**: I tried larger models (DistilBERT, small GPT variants). They were marginally more accurate but significantly slower. For a CLI tool, 94% accuracy at 50ms inference beats 96% at 500ms.

**Enterprise Features Matter**: The open-source version is great for individuals. But teams need SSO, audit logs, and policy enforcement. Building those features early made enterprise adoption smoother.

**ONNX Runtime is Underrated**: For Go-based ML inference, ONNX Runtime provides excellent performance without Python dependencies. The model exports cleanly from PyTorch.

## Conclusion

<a id="conclusion"></a>

Building azath.sh taught me that effective security tools balance detection accuracy with usability. The LLM component wasn't about being fancy—it was about reducing friction for developers while maintaining security rigor.

The combination of fast pattern matching (Go) with contextual understanding (LLM) creates something better than either approach alone. Regex catches the obvious stuff instantly; the LLM handles the nuanced cases that would otherwise slip through or generate false positives.

Like the Azath houses of Steven Erikson's world, we stand as guardians at the threshold—chaining down what would otherwise escape, binding the dangerous to keep the wider world safe. Every secret detected is another chain forged, another entity bound before it can wreak havoc.

If you're struggling with secret leaks in your organization, give Azath a try. The CLI is free and open-source. Enterprise features are available for teams that need them.

Check out the code at [github.com/azathsh/azath](https://github.com/azathsh/azath) or try it now:

```bash
curl -sSfL https://azath.sh/install | sh
azath scan .
```
