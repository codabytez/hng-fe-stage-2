# Invoice App

A full-stack invoice management application built with Next.js, Convex, and Tailwind CSS. Create, edit, send, and track invoices with a clean, responsive UI and real-time data sync.

## Demo Account

| Field    | Value              |
| -------- | ------------------ |
| Email    | `misa@mailsac.com` |
| Password | 1Password!         |

## Features

- **Authentication** — Email/password sign up & sign in via Better Auth, with DiceBear fun-emoji avatars generated on signup
- **Invoice Management** — Create, edit, delete, and view invoices
- **Status Workflow** — Draft → Pending (Send Invoice) → Paid (Mark as Paid)
- **Invoice Form** — Custom date picker, payment terms dropdown, dynamic item list with auto-computed totals
- **Save as Draft** — Bypass validation and save partial invoices
- **Filtering** — Filter invoices by status (Draft, Pending, Paid)
- **Delete Confirmation** — Modal confirmation before destructive actions
- **Logout** — Confirmation modal before signing out
- **Dark Mode** — Full light/dark theme support with system-aware toggle
- **Responsive** — Desktop sidebar, tablet, and mobile layouts

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Language** — [TypeScript](https://www.typescriptlang.org)
- **Backend / DB** — [Convex](https://convex.dev)
- **Auth** — [Better Auth](https://better-auth.com) + `@convex-dev/better-auth`
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Forms** — [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **Animations** — [Framer Motion](https://www.framer.com/motion)
- **Icons** — [Lucide React](https://lucide.dev)
- **Date utils** — [date-fns](https://date-fns.org)
- **Avatars** — [DiceBear](https://dicebear.com) (fun-emoji style)

## Project Structure

```ts
├── app/
│   ├── (auth)/               # Sign in & sign up pages
│   ├── invoices/[id]/        # Invoice detail page
│   └── page.tsx              # Invoice list (home)
├── components/
│   ├── auth/                 # SignInForm, SignUpForm, LogoMark
│   ├── invoice/              # InvoiceList, InvoiceCard, InvoiceForm,
│   │                         # InvoiceDetail, DatePicker, FilterDropdown,
│   │                         # StatusBadge
│   └── layout/               # Sidebar (desktop + mobile)
├── convex/                   # Backend: schema, queries, mutations, auth
└── lib/
    └── validations/          # Zod schemas (auth, invoice)
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

```env
CONVEX_DEPLOYMENT=dev:your-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Set Convex-side secrets via CLI (not in `.env`):

```bash
pnpx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
pnpx convex env set SITE_URL http://localhost:3000
```

### 3. Start Convex

```bash
pnpx convex dev
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Code Quality

```bash
pnpm lint          # ESLint
pnpm format        # Prettier
pnpm check-types   # TypeScript
```

Pre-commit hooks (Husky + lint-staged) run lint and format automatically on every commit.
