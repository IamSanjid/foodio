# Foodio Frontend

Next.js frontend for Foodio Restaurant Ordering System.

## Scripts

Run from the `frontend` workspace:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm run validate
```

Or from the monorepo root with workspace scoping:

```bash
npm run dev -w frontend
npm run build -w frontend
npm run validate -w frontend
```

## Environment

Create `.env` (or `.env.local`) in `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3001
```

## Architecture Notes

- API calls are modularized in `lib/api/*` by domain (`auth`, `categories`, `menu-items`, `orders`).
- Request payload validation uses `zod` schemas in `lib/schemas.ts`.
- Shared API error normalization lives in `lib/errors.ts`.
- State management remains Context-based (`AuthContext`, `CartContext`) in this refactor pass.
