# babalola.dev

Personal portfolio and blog built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Portfolio**: Showcasing projects and professional experience
- **Blog Platform**: Custom blog with markdown support and SEO optimization
- **Subdomain Routing**: Blog runs on `blog.babalola.dev` using Next.js middleware
- **Dark Mode**: Theme switching with persistent preferences
- **Admin Dashboard**: Secure authentication for content management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Docker + AWS/GCP

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BabalolaBrainiac/babalola.dev.git
cd babalola.dev
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your actual values:
   - Generate a `NEXTAUTH_SECRET` (run `openssl rand -base64 32`)
   - Add your Supabase credentials

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/              # Next.js app router
│   ├── blog/         # Blog pages
│   ├── api/          # API routes
│   └── components/   # React components
├── lib/              # Utility functions
└── data/             # Portfolio data

BLOG_POSTS/           # Markdown blog posts
public/               # Static assets
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t babalola-dev .
docker run -p 3000:3000 babalola-dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions |
| `NEXTAUTH_URL` | Your site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## License

MIT License - feel free to use this as inspiration for your own portfolio!

## Contact

- Website: [babalola.dev](https://babalola.dev)
- Email: babaloladanielope@gmail.com
- LinkedIn: [Babalola Opeyemi](https://linkedin.com/in/babalola-opeyemi)
