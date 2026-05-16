# Blog Post Guidelines

These rules codify the standards for all blog posts in this series. They exist to prevent security exposures, maintain consistent tone, and follow established patterns.

## Security Rules (Non-Negotiable)

Never include in any blog post:
- Exact file paths (e.g., `~/.ward/config.yaml`, `/etc/cloudflared/config.yml`)
- Server locations or region names
- Specific URLs or domain names that reveal infrastructure
- Tunnel names, database identifiers, or service names
- Credential files, backup procedures, or infrastructure secrets
- Configuration file contents with real values

Use placeholders and generic descriptions instead:
- Path: `<config-directory>/config.yaml` not `/home/user/.ward/config.yaml`
- URL: `<api-endpoint>` not `api.wardscribe.io`
- Service: `the cache layer` not `redis-prod-1`

## Writing Style (Match Existing Posts)

### Tone & Voice
- Personal narrative driven (not purely technical exposition)
- Include literary references where natural (e.g., Malazan Book of the Fallen)
- Discuss decisions and tradeoffs, not implementation details
- Explain the "why" behind architectural choices
- Write conversationally, as if reflecting on the work

### Structure Pattern
Observed from `meanas-technical-deep-dive.md` and `azath-sh-technical-deep-dive.md`:
1. Open with context or storytelling hook
2. Explain the problem or decision point
3. Walk through the solution at conceptual level
4. Discuss tradeoffs and why this approach was chosen
5. Reflect on what was learned or what comes next
6. Never list or critique specific past mistakes

### Avoid
- Admitting to specific mistakes (e.g., "we added stubs" → generic terms like "accumulated debt")
- Unsolicited architectural suggestions or design critiques
- Code listings with exact infrastructure details
- Specific names of people or tools unless central to narrative
- Em dashes—use periods or commas instead

### Do
- Use generic examples: "the API layer", "the CLI", "the service"
- Focus on decisions made and their implications
- Make it feel like a conversation about tradeoffs
- Keep readers at the architecture level, not the implementation level

## Code Examples

When including code snippets:
- Use placeholder values: `<placeholder>`, `<config-dir>`, `<api-endpoint>`
- Never show real URLs, credentials, or paths
- Keep examples conceptual, not literal
- If exact code is needed for clarity, sanitize all identifiers

Example (correct):
```go
type Client struct {
    base   string
    token  string
    http   *http.Client
}
```

Example (wrong):
```go
type Client struct {
    base:   "https://api.wardscribe.io/api/v1"
    token:  "ghp_xyz123..."
    http:   &http.Client{Timeout: 30 * time.Second}
}
```

## File Organization

- All blog posts go in `BLOG_POSTS/` directory
- Use descriptive filenames: `stack-migration-part-2-execution.md`
- Never create parallel directories (e.g., `blog-tutorials/`, `docs/content/`)
- Link to existing structures, don't duplicate

## Git Commits

- User is the sole author on all commits
- Never add "Co-Authored-By: Claude" to commit messages
- Blog posts are user work; assistants are tools, not contributors
- Commit message example: `blog: add stack migration part 2 — execution writeup`

## Publishing to Supabase

1. Ensure blog post is final and follows all rules above
2. Extract metadata:
   - `title`: From heading (Part 2 - Execution)
   - `slug`: From filename (`stack-migration-part-2-execution`)
   - `excerpt`: 1-2 sentence summary
   - `content`: Full markdown
   - `tags`: Relevant keywords as array
   - `reading_time`: Estimated minutes to read
   - `published`: Current date (2026-05-16 format)

3. Required fields in Supabase blog_posts table:
   - id (UUID)
   - title
   - content
   - excerpt
   - tags
   - slug
   - published
   - author_id
   - meta_description
   - meta_keywords
   - og_title
   - og_description
   - reading_time

4. After insertion, verify:
   - Blog appears on site
   - Markdown renders correctly
   - Links work
   - Code blocks are properly formatted

## Review Checklist

Before publishing any blog post, verify:

- [ ] No exact file paths in content
- [ ] No server locations or infrastructure identifiers
- [ ] No real URLs or domain names exposed
- [ ] No credentials or sensitive data
- [ ] Code examples use placeholders only
- [ ] Tone matches existing posts (narrative, personal, conversational)
- [ ] No specific mistake admissions (use "accumulated debt" language)
- [ ] No unsolicited architectural suggestions
- [ ] Uses existing directory structure
- [ ] Markdown is clean and renders properly
- [ ] Reading time estimate is accurate
- [ ] All metadata is complete

## Related Files

- `BLOG_POSTS/` — published blog directory
- `blog-tutorials/` — if creating guides or tutorials (rare)
- `.gitignore` — ensure credentials/plans never committed

---

*Last updated: 2026-05-16*
