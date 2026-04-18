import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("not_yet"),
  observedDate: text("observed_date"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const wordLogs = pgTable("word_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  type: text("type").notNull().default("word"),
  isPhrase: boolean("is_phrase").notNull().default(false),
  observedDate: text("observed_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const quizResponses = pgTable("quiz_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  answer: text("answer").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  contextSnapshot: text("context_snapshot"),
});
