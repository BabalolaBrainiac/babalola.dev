# babalola.dev

Personal portfolio, blog, upload portal, and private learning platform built with Next.js, TypeScript, Tailwind CSS, Supabase, NextAuth, and Cloudflare R2.

## Surfaces

- `babalola.dev` - portfolio, projects, experience, and contact
- `blog.babalola.dev` - markdown blog with contributor/admin workflows
- `learning.babalola.dev` - authenticated learning workspace and labs
- `uploads.babalola.dev` - token-gated client upload portal
- `jobs.babalola.dev` - focused jobs/resource surface

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use these local hostnames for subdomain routing when needed:

```text
127.0.0.1 blog.localhost
127.0.0.1 learning.localhost
127.0.0.1 uploads.localhost
127.0.0.1 jobs.localhost
```

## Required Environment

```text
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
R2_ACCOUNT_ID=
R2_UPLOADS_BUCKET_NAME=
CF_R2_ACCESS_KEY_ID=
CF_R2_SECRET_ACCESS_KEY=
R2_UPLOADS_PUBLIC_URL=
UPLOAD_SESSION_SECRET=
UPLOAD_TOKEN_HMAC_SECRET=
ZEPTOMAIL_TOKEN=
ZEPTOMAIL_FROM_ADDRESS=
ZEPTOMAIL_FROM_NAME=
```

Generate secrets with `openssl rand -base64 32`. Keep `.env.local`, Vercel project metadata, build output, and TypeScript caches out of git.

## Security Notes

- Subdomain routing uses exact host matching in middleware.
- Admin, blog edit/create, private learning, and upload APIs are role or token protected.
- Uploads use signed multipart URLs and a short-lived HTTP-only upload session cookie.
- Service-role Supabase access is only used server-side.
- Response headers include CSP, frame denial, HSTS, content type sniffing protection, strict referrer policy, and a locked-down permissions policy.
- `/api/execute-code` does not execute arbitrary JavaScript on the server; it only provides a constrained preview for demo content.

## Scripts

```bash
npm run dev
npm run build
```

`npm run lint` is defined for older Next linting, but this project is on Next 13.5 and may need an ESLint config refresh before it is useful.
