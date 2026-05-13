# Learning Platform v3 — Codex Implementation Plan
**Date**: 2026-04-25  
**Author**: Babalola Brainiac  
**Scope**: Email auth, auto-save, Monaco intellisense, content quality uplift  
**Stack**: Next.js 13.5 App Router, Supabase, NextAuth JWT, TailwindCSS, ZeptoMail, TypeScript

---

## Overview

This plan upgrades the learning platform at `learning.babalola.dev` across five dimensions:

1. **Email auth with generated passwords** — any email can request access; a strong password is generated and sent via ZeptoMail; users log in with that credential permanently.
2. **Auto-save everything** — notes, reflections, lab code, task completions, and quiz answers all persist to Supabase, debounced, with no manual save button.
3. **Monaco intellisense** — Python and Rust completions must suggest as you type, including snippets for common ML patterns.
4. **Content quality uplift** — lab starter code comments must teach syntax, not just describe steps. Every stub should show the reader _exactly_ which language construct to use, with a mini example in the comment.
5. **Admin provisioning script** — `scripts/create-learner.ts` that can be run to create/reset a user account and email them credentials.

---

## 1. Dependencies

```bash
npm install zeptomail            # ZeptoMail email SDK
npm install nanoid               # Secure random ID / password generation
```

Add to `.env.local` and Vercel environment:
```
ZEPTOMAIL_TOKEN=Zoho-enczapikey yA6KbHsP6gqhkz9RSRNphsSPpto1rak+iyi0s3ywKcJ2L4S3jKFu0RJpINK8JWbZ0IGDs/0Db94YdIy56olfesUxYdJRfJTGTuv4P2uV48xh8ciEYNYih5quA7YQE6FOeBwiCCwwQ/QiWA==
ZEPTOMAIL_FROM_ADDRESS=noreply@babalola.dev
ZEPTOMAIL_FROM_NAME=Babalola Brainiac
```

---

## 2. Email Service — `src/lib/email.ts`

Create this file. It is the single interface for all email sending.

```ts
// src/lib/email.ts
import { SendMailClient } from 'zeptomail';

const client = new SendMailClient({
  url: 'https://api.zeptomail.eu/v1.1/email',
  token: process.env.ZEPTOMAIL_TOKEN!,
});

const FROM = {
  address: process.env.ZEPTOMAIL_FROM_ADDRESS ?? 'noreply@babalola.dev',
  name: process.env.ZEPTOMAIL_FROM_NAME ?? 'Babalola Brainiac',
};

export async function sendLearnerCredentials(
  toEmail: string,
  toName: string,
  password: string,
): Promise<void> {
  await client.sendMail({
    from: FROM,
    to: [{ email_address: { address: toEmail, name: toName } }],
    subject: 'Your Brainiac Learning Platform Access',
    htmlbody: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="margin:0 0 8px;color:#1e1b4b;">Brainiac Learning Platform</h2>
        <p style="color:#64748b;margin:0 0 24px;">Your account is ready. Use the credentials below to sign in.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;letter-spacing:.05em;text-transform:uppercase;">Email</p>
          <p style="margin:0 0 16px;font-size:15px;color:#0f172a;font-family:monospace;">${toEmail}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;letter-spacing:.05em;text-transform:uppercase;">Password</p>
          <p style="margin:0;font-size:20px;color:#0f172a;font-family:monospace;letter-spacing:.12em;">${password}</p>
        </div>
        <a href="https://learning.babalola.dev/auth/signin"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Sign in now
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          Save this password — it is your permanent credential. If you lose it, request a new one from the sign-in page.
        </p>
      </div>
    `,
  });
}
```

---

## 3. Request-Access API — `src/app/api/auth/request-access/route.ts`

This is the core of the auth flow. When a user submits their email, this route:
1. Validates the email format
2. Generates a strong 12-character alphanumeric password using `nanoid`
3. Hashes it with bcrypt (12 rounds)
4. Upserts into `blog_users` with `role = 'learner'`
5. Emails the plaintext password via ZeptoMail
6. Returns `{ ok: true }` — never returns the password

```ts
// src/app/api/auth/request-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { sendLearnerCredentials } from '@/lib/email';

// 12-char password from a readable alphabet (no confusing chars)
const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  12,
);

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim() || email?.split('@')[0] || 'Learner';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const password = generatePassword();
  const password_hash = await bcrypt.hash(password, 12);

  // Upsert: create new account OR reset password for existing learner
  const { error } = await supabase.from('blog_users').upsert(
    { email, name, password_hash, role: 'learner' },
    { onConflict: 'email' },
  );

  if (error) {
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 });
  }

  try {
    await sendLearnerCredentials(email, name, password);
  } catch (emailErr) {
    console.error('Email send failed:', emailErr);
    // Account was created but email failed — still return ok so caller can retry
    return NextResponse.json({ ok: true, warning: 'email_failed' });
  }

  return NextResponse.json({ ok: true });
}
```

**Rate limiting**: Add a simple in-memory or Supabase-backed rate limit: max 3 requests per email per hour. Use the existing `upload_rate_limits` pattern as a reference.

---

## 4. Signin Page Update — `src/app/auth/signin/page.tsx`

Modify the existing signin page to add a second flow: "Request Access". 

The page should have two modes toggled by a tab or a small link:
- **Sign In**: existing email + password form (unchanged)
- **Get Access**: email-only form that calls `POST /api/auth/request-access`, shows "Check your inbox" on success

```tsx
// Add this state and form to the existing SignInForm component
const [mode, setMode] = useState<'signin' | 'request'>('signin');
const [requestEmail, setRequestEmail] = useState('');
const [requestName, setRequestName] = useState('');
const [requestSent, setRequestSent] = useState(false);
const [requestLoading, setRequestLoading] = useState(false);
const [requestError, setRequestError] = useState('');

async function handleRequestAccess(e: React.FormEvent) {
  e.preventDefault();
  setRequestLoading(true);
  setRequestError('');
  const res = await fetch('/api/auth/request-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: requestEmail, name: requestName }),
  });
  const data = await res.json();
  setRequestLoading(false);
  if (!res.ok) {
    setRequestError(data.error ?? 'Something went wrong');
  } else {
    setRequestSent(true);
  }
}
```

Success state renders:
```
Check your inbox at {email}
We sent your login credentials. 
Come back to this page to sign in.
[← Back to sign in]
```

The existing sign-in form handles `/learning` as a valid callbackUrl (currently it only routes admins/contributors). Fix the `signIn` callback:

```ts
// In handleSubmit, after signIn succeeds:
if (session?.user?.role === 'learner') {
  router.push('/learning');
}
```

Also update `auth.ts` — add `learner` to the session/JWT pass-through. The `authorize()` function already works for any role stored in `blog_users`, no change needed there.

---

## 5. Middleware Update — `src/middleware.ts`

Add protection for `/learning/*` routes: require any authenticated session (any role including `learner`). Currently `/learning` is unprotected.

```ts
// In the authorized callback, add before the `return true` at the bottom:
if (pathname.startsWith('/learning')) {
  // allow the public listing page but protect individual course pages
  if (pathname === '/learning' || pathname === '/learning/') return true;
  return !!token; // must be signed in
}
```

---

## 6. Admin Provisioning Script — `scripts/create-learner.ts`

Run via: `npx ts-node -e "require('./scripts/create-learner.ts')" -- --email user@example.com --name "Jane Doe"`

```ts
// scripts/create-learner.ts
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { sendLearnerCredentials } from '../src/lib/email';

// Load .env.local manually if running outside Next.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  12,
);

async function main() {
  const args = process.argv.slice(2);
  const emailIdx = args.indexOf('--email');
  const nameIdx = args.indexOf('--name');
  const email = args[emailIdx + 1]?.toLowerCase().trim();
  const name = nameIdx !== -1 ? args[nameIdx + 1] : email?.split('@')[0];

  if (!email) {
    console.error('Usage: npx ts-node scripts/create-learner.ts --email user@example.com [--name "Full Name"]');
    process.exit(1);
  }

  const password = generatePassword();
  const password_hash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from('blog_users').upsert(
    { email, name, password_hash, role: 'learner' },
    { onConflict: 'email' },
  );

  if (error) {
    console.error('DB error:', error.message);
    process.exit(1);
  }

  await sendLearnerCredentials(email, name!, password);

  console.log(`✓ Account created for ${email}`);
  console.log(`  Name:     ${name}`);
  console.log(`  Password: ${password}`);
  console.log(`  Email sent via ZeptoMail`);
}

main();
```

---

## 7. Auto-Save Architecture

The Supabase tables already exist (`learning_notes`, `learning_user_task_progress`, `learning_submissions`, `learning_project_files`). What needs to be built is the API layer and the frontend save/load hooks.

### 7a. API Routes

All routes require a valid NextAuth session. They all use the service role Supabase client.

**`POST /api/learning/notes`** — upsert notes or reflection
```
Body: { courseSlug, moduleId, noteType: 'notes' | 'reflection', content }
Response: { ok: true }
```

**`GET /api/learning/notes?courseSlug=mlops&moduleId=week-1-day-1`**
```
Response: { notes: string, reflection: string }
```

**`POST /api/learning/tasks`** — mark a task complete or not
```
Body: { courseSlug, taskId, status: 'completed' | 'not_started' }
Response: { ok: true }
```

**`GET /api/learning/tasks?courseSlug=mlops`**
```
Response: { tasks: Array<{ task_id: string, status: string }> }
```

**`POST /api/learning/code`** — save lab file contents
```
Body: { courseSlug, moduleId, labId, path, content }
Response: { ok: true }
```

**`GET /api/learning/code?courseSlug=mlops&moduleId=week-1-day-1&labId=data-contract-lab`**
```
Response: { files: Array<{ path: string, content: string }> }
```

The code API uses `learning_project_files` but keyed differently from the project workspace. Use `project_id` as a composite of `${courseSlug}:${moduleId}:${labId}` by looking up or creating a `learning_projects` row first.

### 7b. Frontend Save/Load Hook — `src/features/learning/hooks/useLearningState.ts`

```ts
// Debounced auto-save hook for notes and code
import { useCallback, useEffect, useRef } from 'react';

export function useAutoSave(
  courseSlug: string,
  moduleId: string,
  delay = 1500,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const saveNotes = useCallback(
    (noteType: 'notes' | 'reflection', content: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await fetch('/api/learning/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug, moduleId, noteType, content }),
        });
      }, delay);
    },
    [courseSlug, moduleId, delay],
  );

  const saveCode = useCallback(
    (labId: string, path: string, content: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        await fetch('/api/learning/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug, moduleId, labId, path, content }),
        });
      }, delay);
    },
    [courseSlug, moduleId, delay],
  );

  const saveTask = useCallback(
    async (taskId: string, status: 'completed' | 'not_started') => {
      await fetch('/api/learning/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug, taskId, status }),
      });
    },
    [courseSlug],
  );

  return { saveNotes, saveCode, saveTask };
}
```

### 7c. Load on Mount

In `LearningWorkspaceClient.tsx`, on mount (when `session.user.id` is available), fire these loads in parallel:
```ts
const [notesRes, tasksRes, codeRes] = await Promise.all([
  fetch(`/api/learning/notes?courseSlug=${courseSlug}&moduleId=${module.id}`),
  fetch(`/api/learning/tasks?courseSlug=${courseSlug}`),
  fetch(`/api/learning/code?courseSlug=${courseSlug}&moduleId=${module.id}&labId=${lab.id}`),
]);
```

Populate state from responses. If unauthenticated (session null), fall back to localStorage only — no errors.

### 7d. Save Indicators

Add a small "Saved" badge next to every textarea that shows:
- Gray dot + "Unsaved" when content has changed but timer hasn't fired
- Spinning indicator when saving in flight
- Green checkmark + "Saved" for 2s after successful save
- Red dot + "Save failed" if the fetch returns an error

---

## 8. Monaco Editor Intellisense Fix

The current Monaco config is missing `quickSuggestions` and has no custom completion provider for Python. This makes the IDE feel dead.

### 8a. Editor Options

Replace the Monaco `<Editor>` options prop with:

```ts
const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  lineHeight: 1.6,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 4,
  insertSpaces: true,
  theme: 'one-dark-pro',
  // --- Intellisense settings ---
  quickSuggestions: { other: true, comments: false, strings: true },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: true,
  parameterHints: { enabled: true },
  suggest: {
    showFields: true,
    showFunctions: true,
    showVariables: true,
    showClasses: true,
    showModules: true,
    showKeywords: true,
    showSnippets: true,
    filterGraceful: true,
    insertMode: 'replace',
  },
  // --- Visual ---
  renderLineHighlight: 'line',
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  bracketPairColorization: { enabled: true },
};
```

### 8b. Python Completion Provider

Register this once when the component mounts (in a `useEffect` with a ref to avoid duplicate registrations):

```ts
useEffect(() => {
  if (!window.monaco) return;
  const disposable = window.monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.', '(', ' ', '\n'],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const suggestions: monaco.languages.CompletionItem[] = [
        // --- Python builtins ---
        mkSnippet('def', 'def ${1:name}(${2:args}):\n\t${3:pass}', 'Function definition', range),
        mkSnippet('class', 'class ${1:Name}:\n\tdef __init__(self):\n\t\t${2:pass}', 'Class definition', range),
        mkSnippet('dataclass', '@dataclass\nclass ${1:Name}:\n\t${2:field}: ${3:type}', 'Dataclass', range),
        mkSnippet('dataclass_frozen', '@dataclass(frozen=True)\nclass ${1:Name}:\n\t${2:field}: ${3:type}', 'Frozen dataclass', range),
        mkSnippet('isinstance', 'isinstance(${1:obj}, ${2:type})', 'isinstance check', range),
        mkSnippet('all', 'all(${1:expr} for ${2:item} in ${3:iterable})', 'all() check', range),
        mkSnippet('any', 'any(${1:expr} for ${2:item} in ${3:iterable})', 'any() check', range),
        mkSnippet('dict.get', '${1:d}.get("${2:key}", ${3:default})', 'Safe dict access', range),
        mkSnippet('try_except', 'try:\n\t${1:pass}\nexcept ${2:Exception} as exc:\n\t${3:raise}', 'try/except block', range),
        mkSnippet('raise_value_error', 'raise ValueError("${1:message}")', 'Raise ValueError', range),
        // --- ML patterns ---
        mkSnippet('validate_payload', 'def validate_payload(raw: dict) -> dict:\n\tage = raw.get("age")\n\tif age is not None and age < 0:\n\t\traise ValueError("Age cannot be negative")\n\tfeatures = raw.get("features", [])\n\tif not all(isinstance(v, float) for v in features):\n\t\traise ValueError("Features must be floats")\n\treturn raw', 'Payload validator', range),
        mkSnippet('detect_drift', 'def detect_drift(batch: list[float], baseline: float, threshold: float) -> str:\n\tmean_val = sum(batch) / len(batch)\n\tif abs(mean_val - baseline) > threshold:\n\t\treturn "ALERT: drift detected"\n\treturn "OK: stable"', 'Drift detector', range),
        mkSnippet('hash_config', 'import hashlib, json\ndef hash_config(cfg: dict) -> str:\n\treturn hashlib.sha256(json.dumps(cfg, sort_keys=True).encode()).hexdigest()[:12]', 'Config hasher', range),
        mkSnippet('fastapi_route', 'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass ${1:Request}(BaseModel):\n\t${2:field}: ${3:type}\n\n@app.post("/${4:endpoint}")\ndef ${4:endpoint}(payload: ${1:Request}):\n\treturn {"status": "ok"}', 'FastAPI route', range),
        mkSnippet('pathlib_read', 'from pathlib import Path\ncontent = Path("${1:path}").read_text()', 'Read file with pathlib', range),
        mkSnippet('joblib_save', 'import joblib\njoblib.dump(${1:model}, "${2:path}.joblib")', 'Save model with joblib', range),
        mkSnippet('joblib_load', 'model = joblib.load("${1:path}.joblib")', 'Load model with joblib', range),
        mkSnippet('sorted_list', 'sorted_data = sorted(${1:items}, key=lambda x: x${2:.field})','Sorted list', range),
      ];
      return { suggestions };
    },
  });
  return () => disposable.dispose();
}, []);

function mkSnippet(
  label: string,
  insertText: string,
  detail: string,
  range: monaco.IRange,
): monaco.languages.CompletionItem {
  return {
    label,
    kind: window.monaco.languages.CompletionItemKind.Snippet,
    detail,
    insertText,
    insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  };
}
```

### 8c. Hover Documentation

Register `registerHoverProvider` for Python to show inline docs for common ML concepts when the user hovers over keywords like `validate_payload`, `detect_drift`, etc.

---

## 9. Content Quality Uplift — Lab Stub Comments

Every lab starter file must teach the reader _how_ to write the code, not just say _what_ to write. The current pattern:
```python
# 1. Read age using raw_data.get("age")
# 2. Raise ValueError("Age cannot be negative") if age < 0
```
is informational but not instructional — the learner still doesn't know the syntax.

### The new standard for all lab stubs:

```python
def validate_payload(raw_data: dict) -> dict:
    # ── Step 1: Read a value safely from a dict ───────────────────
    # Use .get() so you don't raise KeyError if the key is missing.
    # Syntax:  value = my_dict.get("key")           → None if missing
    #          value = my_dict.get("key", default)  → default if missing
    # ─────────────────────────────────────────────────────────────
    age = raw_data.get("age")

    # ── Step 2: Raise an error if the value is invalid ────────────
    # if some_condition:
    #     raise ValueError("your message here")
    # Note: check `age is not None` first so you don't compare None < 0
    # ─────────────────────────────────────────────────────────────
    if age is not None and age < 0:
        raise ValueError("Age cannot be negative")

    # ── Step 3: Read a list with a default ────────────────────────
    # raw_data.get("features", []) returns [] if "features" is absent
    # ─────────────────────────────────────────────────────────────
    features = raw_data.get("features", [])

    # ── Step 4: Validate all items in a list ─────────────────────
    # isinstance(item, float) → True if item is a float, else False
    # all(predicate for item in collection) → True only if every item passes
    # Example: all(isinstance(x, float) for x in [1.0, 2.0])  → True
    #          all(isinstance(x, float) for x in [1.0, "x"])  → False
    # ─────────────────────────────────────────────────────────────
    if not all(isinstance(item, float) for item in features):
        raise ValueError("Features must be floats")

    return raw_data
```

### Apply this standard to every lab in:
- `src/features/learning/data/catalog.ts` — all Week 1 labs
- `src/features/learning/data/mlops-week2.ts` — all Week 2 labs
- `src/features/learning/data/mlops-weeks3to10.ts` — all Weeks 3-5 labs

For each lab, the editable file should:
1. Keep the function signature and docstring intact
2. Replace bare `# do X` comments with the three-part structure: **concept name**, **syntax reminder with example**, **implementation slot**
3. Leave the `TODO` comment at the very end of each step as the actual blank to fill in
4. Never give away the solution in the comments — show the mechanism, not the output

---

## 10. Database Migration — `supabase/migrations/20260427000000_learner_role.sql`

The `blog_users.role` column currently uses a CHECK constraint. If it does, add `learner` to it:

```sql
-- Allow learner role in blog_users (if role column has a CHECK constraint)
ALTER TABLE public.blog_users
  DROP CONSTRAINT IF EXISTS blog_users_role_check;

ALTER TABLE public.blog_users
  ADD CONSTRAINT blog_users_role_check
  CHECK (role IN ('admin', 'contributor', 'learner'));

-- Ensure all learning tables reference blog_users correctly
-- (already done in v2 migration — this is a no-op safety check)
ALTER TABLE public.learning_notes
  DROP CONSTRAINT IF EXISTS learning_notes_user_id_fkey;

ALTER TABLE public.learning_notes
  ADD CONSTRAINT learning_notes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.blog_users(id) ON DELETE CASCADE;
```

---

## 11. `.env.example` Update

```
# ZeptoMail
ZEPTOMAIL_TOKEN=your-zeptomail-token-here
ZEPTOMAIL_FROM_ADDRESS=noreply@babalola.dev
ZEPTOMAIL_FROM_NAME=Babalola Brainiac
```

---

## 12. Implementation Order

Work in this exact sequence to avoid broken intermediate states:

1. **`npm install zeptomail nanoid`**
2. **`src/lib/email.ts`** — ZeptoMail wrapper
3. **`supabase/migrations/20260427000000_learner_role.sql`** — run in Supabase dashboard
4. **`src/app/api/auth/request-access/route.ts`** — access request endpoint
5. **`src/app/auth/signin/page.tsx`** — add "Get Access" tab to signin page; fix learner routing
6. **`src/middleware.ts`** — protect `/learning/*` routes
7. **`src/app/api/learning/notes/route.ts`** — GET and POST
8. **`src/app/api/learning/tasks/route.ts`** — GET and POST
9. **`src/app/api/learning/code/route.ts`** — GET and POST
10. **`src/features/learning/hooks/useLearningState.ts`** — auto-save hook
11. **`src/features/learning/components/LearningWorkspaceClient.tsx`** — wire auto-save; fix Monaco options; add Python completion provider; add save indicator UI
12. **Update all lab content** in catalog.ts, mlops-week2.ts, mlops-weeks3to10.ts with instructional stub comments
13. **`scripts/create-learner.ts`** — admin provisioning script
14. **Test end-to-end** (see Section 13)
15. **Deploy**: `vercel --prod`

---

## 13. End-to-End Testing Checklist

### Auth Flow
- [ ] Visit `learning.babalola.dev` — unauthenticated, can see the public listing
- [ ] Click "Start Learning" on a course — redirected to `/auth/signin?callbackUrl=/learning/mlops`
- [ ] On signin page, switch to "Get Access" tab
- [ ] Enter a real email → receive email within 60 seconds with password
- [ ] Copy password, switch to "Sign In" tab, sign in → land on `/learning/mlops`
- [ ] Reload page → still authenticated
- [ ] Sign out → redirected to `/auth/signin`
- [ ] Sign in again with same email + password → still works
- [ ] Run `scripts/create-learner.ts --email test@example.com` → email received

### Auto-Save
- [ ] Open a module with a notes tab → type text → stop typing → wait 1.5s → "Saved" badge appears
- [ ] Reload page → typed text is still there
- [ ] Open a lab → edit the Python file → save indicator appears
- [ ] Reload → lab edits are restored
- [ ] Check a task checkbox → reload → checkbox is still checked
- [ ] Answer a quiz → reload → quiz answer is remembered

### Monaco Intellisense
- [ ] Open a Python lab → type `def ` → completion list appears
- [ ] Type `val` → `validate_payload` snippet appears
- [ ] Tab-complete a snippet → cursor jumps to first tab stop
- [ ] Type `raw_data.get(` → parameter hint appears
- [ ] Open a Rust lab → basic Rust completions appear

### Email Edge Cases
- [ ] Request access for already-existing email → password is reset, new email is sent
- [ ] Request access with malformed email → 400 error shown inline, no email sent
- [ ] Request access 4 times in rapid succession → 4th request is rate-limited

---

## 14. Files Modified / Created Summary

| File | Action |
|------|--------|
| `package.json` | Add `zeptomail`, `nanoid` |
| `.env.local` / `.env.example` | Add ZeptoMail vars |
| `src/lib/email.ts` | **CREATE** |
| `src/app/api/auth/request-access/route.ts` | **CREATE** |
| `src/app/auth/signin/page.tsx` | **MODIFY** — add Get Access tab, fix learner routing |
| `src/middleware.ts` | **MODIFY** — add learner auth guard for `/learning/*` |
| `src/app/api/learning/notes/route.ts` | **CREATE** |
| `src/app/api/learning/tasks/route.ts` | **CREATE** |
| `src/app/api/learning/code/route.ts` | **CREATE** |
| `src/features/learning/hooks/useLearningState.ts` | **CREATE** |
| `src/features/learning/components/LearningWorkspaceClient.tsx` | **MODIFY** — Monaco options, completion provider, auto-save wiring, save indicators |
| `src/features/learning/data/catalog.ts` | **MODIFY** — update all lab stub comments to instructional standard |
| `src/features/learning/data/mlops-week2.ts` | **MODIFY** — update all lab stub comments |
| `src/features/learning/data/mlops-weeks3to10.ts` | **MODIFY** — update all lab stub comments |
| `scripts/create-learner.ts` | **CREATE** |
| `supabase/migrations/20260427000000_learner_role.sql` | **CREATE** |

---

## 15. Notes for Codex

- The project is at `/Users/opeyemibabalola/Desktop/Workspace/opeyemi/projects/babalola.dev`
- `src/lib/supabase.ts` exports `supabase` — a service-role client. Use this in all API routes.
- `src/lib/auth.ts` has the NextAuth config. The `authorize` function queries `blog_users` by email. It already works for any role — just add `learner` routing in the signin page callback.
- All API routes that modify learning data should call `getServerSession(authOptions)` and return `{ ok: false }` if no session.
- `blog_users` table columns: `id (uuid)`, `email`, `name`, `password_hash`, `role`, `created_at`, `updated_at`
- The ZeptoMail token is given — put it in `.env.local` only, never commit it.
- The learning workspace lives in `src/features/learning/`. Types are in `src/features/learning/types.ts`.
- Do not break the existing admin/blog auth. The `blog_users` table is shared — learners just have role `learner`.
- Existing learning API routes: `/api/learning/session` (GET/POST), `/api/learning/state` (GET/POST). Check `/api/learning/state` before creating `/api/learning/notes` — they may overlap.
