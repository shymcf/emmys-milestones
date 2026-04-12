import crypto from "crypto";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const children = sqliteTable("children", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const milestones = sqliteTable("milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id),
  category: text("category").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("not_yet"),
  observedDate: text("observed_date"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const wordLogs = sqliteTable("word_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id),
  word: text("word").notNull(),
  isPhrase: integer("is_phrase", { mode: "boolean" }).notNull().default(false),
  observedDate: text("observed_date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const quizResponses = sqliteTable("quiz_responses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id),
  questionId: text("question_id").notNull(),
  answer: text("answer").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const recommendations = sqliteTable("recommendations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  childId: text("child_id")
    .notNull()
    .references(() => children.id),
  category: text("category").notNull(),
  content: text("content").notNull(),
  generatedAt: integer("generated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  contextSnapshot: text("context_snapshot"),
});
