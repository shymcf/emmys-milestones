import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  index,
  check,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const children = pgTable(
  "children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_children_user_id").on(table.userId)]
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    status: text("status").notNull().default("not_yet"),
    observedDate: text("observed_date"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_milestones_child_id").on(table.childId),
    check(
      "milestones_status_chk",
      sql`status IN ('not_yet','sometimes','consistently')`
    ),
    check(
      "milestones_category_chk",
      sql`category IN ('language','gross_motor','fine_motor')`
    ),
  ]
);

export const wordLogs = pgTable(
  "word_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    word: varchar("word", { length: 80 }).notNull(),
    type: text("type").notNull().default("word"),
    isPhrase: boolean("is_phrase").notNull().default(false),
    observedDate: text("observed_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_word_logs_child_id").on(table.childId),
    check("word_logs_type_chk", sql`type IN ('word','gesture')`),
  ]
);

export const quizResponses = pgTable(
  "quiz_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    childId: uuid("child_id")
      .notNull()
      .references(() => children.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answer: text("answer").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_quiz_responses_child_id").on(table.childId)]
);

export const recommendations = pgTable(
  "recommendations",
  {
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
  },
  (table) => [index("idx_recommendations_child_id").on(table.childId)]
);
