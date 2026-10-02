import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  time,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'MEMBER']);
export const readingTypeEnum = pgEnum('reading_type', ['FIRST', 'PSALM', 'SECOND', 'GOSPEL']);
const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  phone: varchar('phone', { length: 25 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  community: varchar('community', { length: 120 }).notNull().default(''),
  role: roleEnum('role').default('MEMBER').notNull(),
  ...timestamps(),
});
export const sessions = pgTable(
  'sessions',
  {
    tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expiry_idx').on(t.expiresAt)],
);
export const masses = pgTable(
  'masses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    date: date('date').notNull(),
    time: time('time').notNull(),
    location: varchar('location', { length: 160 }).notNull(),
    celebrant: varchar('celebrant', { length: 120 }).notNull(),
    description: text('description').notNull().default(''),
    ...timestamps(),
  },
  (t) => [index('masses_date_idx').on(t.date, t.time)],
);
export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 160 }).notNull(),
    description: text('description').notNull().default(''),
    date: date('date').notNull(),
    time: time('time').notNull(),
    location: varchar('location', { length: 160 }).notNull(),
    ...timestamps(),
  },
  (t) => [index('events_date_idx').on(t.date, t.time)],
);
export const notices = pgTable(
  'notices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 160 }).notNull(),
    content: text('content').notNull(),
    publishedAt: date('published_at').notNull(),
    ...timestamps(),
  },
  (t) => [index('notices_published_idx').on(t.publishedAt)],
);
export const readings = pgTable(
  'readings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    date: date('date').notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    type: readingTypeEnum('type').notNull(),
    reference: varchar('reference', { length: 200 }).notNull(),
    content: text('content').notNull(),
    source: varchar('source', { length: 500 }).notNull(),
    ...timestamps(),
  },
  (t) => [uniqueIndex('readings_date_type_idx').on(t.date, t.type)],
);
export const authAttempts = pgTable('auth_attempts', {
  key: varchar('key', { length: 64 }).primaryKey(),
  count: integer('count').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'passwordHash'>;
export type Mass = typeof masses.$inferSelect;
export type ParishEvent = typeof events.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type Reading = typeof readings.$inferSelect;
