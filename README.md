# Buna Investors Group — Customer Web Application

Production-ready customer-facing web application for **Buna Investors Group**, an Ethiopian coffee investment platform.

## Architecture

```
src/
├── api/              # Typed API client (Axios + interceptors)
│   ├── client.ts     # Axios instance, ApiError class, interceptors
│   ├── services.ts   # All API endpoint functions
│   └── index.ts      # Barrel export
├── components/
│   ├── layout/       # AppLayout, ProtectedRoute
│   └── ui/           # Reusable design system components
├── hooks/            # Auth context, toast system
├── lib/              # Config, utility functions
├── pages/            # All route page components
└── types/            # TypeScript domain types
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | React Query + Context | Server state caching with minimal client state |
| API Client | Axios | Interceptors, error normalization, upload progress |
| Forms | Controlled components + manual validation | Lightweight, full control |
| Styling | Tailwind CSS v4 | Utility-first, dark theme, design tokens |
| Routing | React Router v7 | Lazy-loaded routes, protected route wrapper |
| Icons | Lucide React | Tree-shakeable, consistent icon set |
| Auth | HTTP-only cookies | Secure, no localStorage secrets |

### Core Principles

- **Backend is the source of truth** — no financial calculations on the client
- **No mock data in production** — all data comes from the API
- **Mobile-first** — bottom navigation, touch targets, responsive cards
- **Accessible** — semantic HTML, ARIA, keyboard navigation, focus rings

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone <repo-url>
cd buna-investors-customer-web
npm install
```

### Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g., `http://localhost:3000/api/v1`) |
| `VITE_APP_NAME` | No | Application name (defaults to "Buna Investors Group") |
| `VITE_MAX_UPLOAD_SIZE` | No | Max upload size in bytes (defaults to 5MB) |

> **Security**: Only `VITE_` prefixed variables are exposed to the browser. Never add secrets here.

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | Sign In | No |
| `/register` | Create Account | No |
| `/dashboard` | Dashboard Overview | Yes |
| `/packages` | Coffee Packages (Available + My) | Yes |
| `/packages/buy` | Purchase Flow | Yes |
| `/wallet` | Wallet Balance + Recent Transactions | Yes |
| `/transactions` | Full Transaction History | Yes |
| `/daily-income` | Daily Income Claims | Yes |
| `/referrals` | Referral Code, Link & History | Yes |
| `/withdraw` | Withdrawal Request + History | Yes |
| `/rewards` | Reward Code Redemption | Yes |
| `/notifications` | Notification Center | Yes |
| `/profile` | Account Settings & Password | Yes |

## API Integration

The API client (`src/api/client.ts`) is configured with:

- **Base URL** from `VITE_API_BASE_URL`
- **Credentials**: `withCredentials: true` (HTTP-only cookies)
- **Error normalization**: All API errors are converted to typed `ApiError` instances
- **401 handling**: Auth errors trigger session clear + redirect to login

All API functions are typed with request/response interfaces in `src/types/index.ts`.

## Design System

Built on Tailwind CSS v4 with custom `@theme` tokens:

- **Brand colors**: Warm coffee-inspired palette (`brand-50` through `brand-950`)
- **Surface colors**: Dark mode neutrals with subtle blue tint
- **Status colors**: Success (green), Warning (amber), Danger (red), Info (blue)
- **Typography**: Inter font family
- **Components**: Button, Input, Select, Modal, Card, Badge, StatusBadge, Skeleton, EmptyState, Pagination, FileUpload, Alert, Toast, PageHeader, CurrencyDisplay

## Deployment (Vercel)

1. Connect the repository to Vercel
2. Set environment variables in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `dist`
5. SPA routing is handled via `vercel.json` rewrites

## Security

- Authentication uses **HTTP-only cookies** (no localStorage)
- No financial calculations on the frontend
- No secrets in `VITE_` environment variables
- File uploads go through the backend (no direct R2/S3 access)
- CORS configured for credentialed requests
- Security headers set via `vercel.json`
- No `dangerouslySetInnerHTML` usage
- Input validation on both client and server

## Business Rules (Frontend Display Only)

These are displayed to the user but **enforced by the backend**:

| Rule | Value |
|------|-------|
| Registration Bonus | 100 ETB (locked until first purchase) |
| Daily Income Rate | 7.14% per day |
| Package Duration | 40 days |
| Referral Commission | 20% |
| Minimum Withdrawal | 150 ETB |
| Currency | ETB (Ethiopian Birr) |
| Timezone | Africa/Addis_Ababa |

## License

Private — Buna Investors Group
