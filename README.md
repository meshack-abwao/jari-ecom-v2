# Jari.Ecom V2

A modern, clean e-commerce platform built with JSONB-powered flexibility.

## Architecture

- **API**: Node.js + Express + PostgreSQL
- **Dashboard**: React + Vite
- **Store**: Vanilla JS + Vite

## Structure

```
jari-ecom-v2/
├── api/          # Backend API
├── dashboard/    # Admin Panel
├── store/        # Customer Store
└── shared/       # Shared configs
```

## Quick Start

### 1. Database Setup
```bash
cd api
cp .env.example .env
# Edit .env with your PostgreSQL URL
npm install
npm run migrate
```

### 2. Start API
```bash
cd api
npm run dev
# Runs on http://localhost:3000
```

### 3. Start Dashboard
```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Start Store
```bash
cd store
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5174
```

## Environment Variables

### API (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
PORT=3000
```

### Dashboard (.env)
```
VITE_API_URL=http://localhost:3000
```

### Store (.env)
```
VITE_API_URL=http://localhost:3000
```

## Database Schema

6 tables total:
- `users` - Authentication
- `stores` - Store config (JSONB)
- `products` - Product data (JSONB)
- `orders` - Orders with items (JSONB)
- `templates` - Template definitions
- `themes` - Theme colors

## Key Features

- JSONB for flexible data (no schema migrations for new fields)
- UUID primary keys
- Clean REST API
- JWT authentication
- Template-based product system
