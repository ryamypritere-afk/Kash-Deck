# CashDeck — Financial Command Center for Nigeria

CashDeck is a production-grade personal and business financial operating system designed for individuals and SMEs in Nigeria.

It provides automated ledger management, multi-account aggregation, invoice-to-cash reconciliation, deterministic metrics reporting, and an AI financial assistant.

## Features

- **Personal & Business Workspaces**: Multi-tenant workspace model with granular role-based access control (Owner, Manager, Cashier, Accountant, Viewer).
- **Double-Entry & Minor Unit Integrity**: All monetary values stored as integer kobo (minor units) with ISO currency codes.
- **Deterministic Metrics Engine**: Single source of truth for all P&L, balance sheet, runway, and cash-flow analytics.
- **Transaction Reconciliation**: Deterministic pattern matching connecting bank transactions to sales invoices, supplier payables, and internal transfers.
- **Zero-Guessing Security**: Low-confidence bank inflows route to review queues rather than hallucinating categories.
- **Real Exports & Statements**: Server-side PDF and Excel generation for financial statements and audits.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, TanStack Query, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (embedded PGlite locally for zero-setup local dev; external Postgres supported via `DATABASE_URL`) with Drizzle ORM.
- **Authentication**: JWT access + rotating refresh tokens in httpOnly cookies, password hashing with bcrypt, TOTP 2FA, session revocation.
- **AI Engine**: Google Gemini API via `@google/genai` (server-side function calling only).

## Getting Started

### Prerequisites

- Node.js >= 20.x

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd cashdeck

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start the development server (runs backend and Vite frontend on port 3000)
npm run dev
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```
