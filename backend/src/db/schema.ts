import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth-schema.js';

// Define enums
export const pressureModeEnum = pgEnum('pressure_mode', [
  'calm',
  'realistic',
  'brutal',
]);

export const premiumTypeEnum = pgEnum('premium_type', [
  'one_time',
  'subscription',
]);

// Exams table
export const exams = pgTable('exams', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  subject: text('subject'),
  dateTime: timestamp('date_time').notNull(),
  location: text('location'),
  pressureMode: pressureModeEnum('pressure_mode').notNull().default('calm'),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  defaultPressureMode: pressureModeEnum('default_pressure_mode')
    .notNull()
    .default('calm'),
  notificationsEnabled: boolean('notifications_enabled').default(false).notNull(),
  pureBlackMode: boolean('pure_black_mode').default(false).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  premiumType: premiumTypeEnum('premium_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const examsRelations = relations(exams, ({ one }) => ({
  user: one(user, {
    fields: [exams.userId],
    references: [user.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  exams: many(exams),
  settings: one(userSettings),
}));
