# Foodio - Restaurant Ordering System

A premium, simplified Restaurant Ordering System built with Next.js, NestJS, and PostgreSQL.

## Features

- **Public Site**: Browse categories and menu items, search, and filter.
- **User Authentication**: Secure login and registration with JWT.
- **Cart Management**: Add multiple items to a persistent cart.
- **Order Placement**: Consolidated order submission with price and availability validation.
- **Order Tracking**: Real-time status tracking for users (Pending -> Preparing -> Ready -> Completed).
- **Admin Dashboard**: Comprehensive management of categories, items, and the order queue.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport.js, JWT.

## Setup Instructions

```bash
# Install dependencies from the root directory
npm install
```

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Backend Setup

1. Navigate to the `backend` directory: `cd backend`
2. Create a `.env` file based on the provided `./backend/.env.example` file:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=foodio
   JWT_SECRET=supersecret
   ```
3. Start the server: `npm run start:dev`
   - _Note: The database will be seeded automatically on the first run if empty._

### Frontend Setup

1. Navigate to the `frontend` directory: `cd frontend`
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. Start the development server: `npm run dev`

## Default Credentials

- **Admin**: `admin@foodio.com` / `admin123`
- **User**: `user@foodio.com` / `user123`
