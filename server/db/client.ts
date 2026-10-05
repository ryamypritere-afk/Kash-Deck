import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { env } from '../config/env';

// Ensure data directory exists for embedded Postgres persistence
const dbDir = path.resolve(process.cwd(), env.DB_STORAGE_DIR);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize PGlite database
export const pglite = new PGlite(dbDir);
export const db = drizzle(pglite, { schema });

// Initialize database schema tables via DDL if not already created
export async function initializeDatabase() {
  await pglite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      phone_verified_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      two_factor_secret TEXT,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      two_factor_recovery_codes TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      device TEXT,
      ip TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL DEFAULT 'free',
      is_demo INTEGER NOT NULL DEFAULT 0,
      settings_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_profiles (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      legal_name TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'Retail',
      rc_number TEXT,
      tin TEXT,
      address TEXT,
      is_vat_registered INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      institution TEXT NOT NULL,
      name TEXT NOT NULL,
      masked_number TEXT,
      currency TEXT NOT NULL DEFAULT 'NGN',
      opening_balance_minor INTEGER NOT NULL DEFAULT 0,
      current_balance_minor INTEGER NOT NULL DEFAULT 0,
      available_balance_minor INTEGER NOT NULL DEFAULT 0,
      include_in_net_worth INTEGER NOT NULL DEFAULT 1,
      is_archived INTEGER NOT NULL DEFAULT 0,
      provider_link_id TEXT,
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      parent_id TEXT,
      icon TEXT,
      color TEXT,
      is_business_cogs INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      occurred_at TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      description TEXT NOT NULL,
      original_description TEXT,
      merchant_id TEXT,
      category_id TEXT,
      classification TEXT NOT NULL DEFAULT 'Personal',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'posted',
      source TEXT NOT NULL DEFAULT 'manual',
      external_id TEXT,
      dedupe_hash TEXT,
      transfer_group_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      actor_id TEXT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      before_snapshot TEXT,
      after_snapshot TEXT,
      ip TEXT,
      request_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
    CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_workspace ON accounts(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON transactions(workspace_id, occurred_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);
  `);

  console.log('[CashDeck DB] PostgreSQL schema initialized successfully.');
}
