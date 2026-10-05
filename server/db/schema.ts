import { pgTable, text, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerifiedAt: text('email_verified_at'),
  phoneVerifiedAt: text('phone_verified_at'),
  status: text('status').notNull().default('active'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: integer('two_factor_enabled').notNull().default(0),
  twoFactorRecoveryCodes: text('two_factor_recovery_codes'),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 2. Sessions Table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  device: text('device'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  revokedAt: text('revoked_at'),
  createdAt: text('created_at').notNull()
});

// 3. Workspaces Table
export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'personal' | 'business'
  name: text('name').notNull(),
  currency: text('currency').notNull().default('NGN'),
  timezone: text('timezone').notNull().default('Africa/Lagos'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().default('free'),
  isDemo: integer('is_demo').notNull().default(0),
  settingsJson: text('settings_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 4. Workspace Members Table
export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // 'owner' | 'manager' | 'cashier' | 'accountant' | 'viewer'
  createdAt: text('created_at').notNull()
});

// 5. Business Profiles Table
export const businessProfiles = pgTable('business_profiles', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  legalName: text('legal_name').notNull(),
  businessType: text('business_type').notNull().default('Retail'),
  rcNumber: text('rc_number'),
  tin: text('tin'),
  address: text('address'),
  isVatRegistered: integer('is_vat_registered').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 6. Financial Accounts Table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  type: text('type').notNull(), // 'bank' | 'cash' | 'wallet' | 'card' | 'loan' | 'credit'
  institution: text('institution').notNull(),
  name: text('name').notNull(),
  maskedNumber: text('masked_number'),
  currency: text('currency').notNull().default('NGN'),
  openingBalanceMinor: integer('opening_balance_minor').notNull().default(0),
  currentBalanceMinor: integer('current_balance_minor').notNull().default(0),
  availableBalanceMinor: integer('available_balance_minor').notNull().default(0),
  includeInNetWorth: integer('include_in_net_worth').notNull().default(1),
  isArchived: integer('is_archived').notNull().default(0),
  providerLinkId: text('provider_link_id'),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 7. Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'), // null = system default
  name: text('name').notNull(),
  kind: text('kind').notNull(), // 'income' | 'expense' | 'transfer'
  parentId: text('parent_id'),
  icon: text('icon'),
  color: text('color'),
  isBusinessCogs: integer('is_business_cogs').notNull().default(0),
  createdAt: text('created_at').notNull()
});

// 8. Transactions Table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  occurredAt: text('occurred_at').notNull(),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull().default('NGN'),
  description: text('description').notNull(),
  originalDescription: text('original_description'),
  merchantId: text('merchant_id'),
  categoryId: text('category_id'),
  classification: text('classification').notNull().default('Personal'),
  notes: text('notes'),
  status: text('status').notNull().default('posted'), // 'posted' | 'pending' | 'needs_review' | 'reversed'
  source: text('source').notNull().default('manual'), // 'manual' | 'import' | 'bank' | 'sale' | 'purchase'
  externalId: text('external_id'),
  dedupeHash: text('dedupe_hash'),
  transferGroupId: text('transfer_group_id'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at')
});

// 9. Audit Logs Table (Append-only)
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  beforeSnapshot: text('before_snapshot'),
  afterSnapshot: text('after_snapshot'),
  ip: text('ip'),
  requestId: text('request_id'),
  createdAt: text('created_at').notNull()
});
