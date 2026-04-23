# invoice-app

A [Next.js](https://nextjs.org) project bootstrapped with [create-next-template](https://github.com/codabytez/create-next-template).

## Tech Stack

- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- Framer Motion
- TanStack Query + Axios
- React Hook Form + Zod
- Iconsax React
- Convex

## Getting Started

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Additional Setup

```bash
npx convex dev
```

## Code Quality

This project uses ESLint, Prettier, and Husky pre-commit hooks to enforce consistent code style.

```bash
pnpm run lint          # lint
pnpm run format        # format
pnpm run check-types   # type check
```
