import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

// USERS
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    lastActiveAt: integer("last_active_at", { mode: "timestamp" }),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    roleIdx: index("users_role_idx").on(t.role),
  })
);

// SEMESTERS
export const semesters = sqliteTable("semesters", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  order: integer("order").notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
});

// UNITS
export const units = sqliteTable(
  "units",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    semesterId: text("semester_id").notNull().references(() => semesters.id),
    number: integer("number").notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    description: text("description"),
    iconKey: text("icon_key"),
    colorHint: text("color_hint"),
    order: integer("order").notNull(),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    semesterIdx: index("units_semester_idx").on(t.semesterId),
  })
);

// FILES (PDFs)
export const files = sqliteTable(
  "files",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    unitId: text("unit_id").notNull().references(() => units.id),
    titleAr: text("title_ar").notNull(),
    type: text("type", {
      enum: ["question_bank", "answer_key", "exam", "exam_solution", "review"],
    }).notNull(),
    examNumber: integer("exam_number"),
    source: text("source", { enum: ["repo", "blob"] }).notNull(),
    path: text("path").notNull(),
    sizeBytes: integer("size_bytes"),
    downloadCount: integer("download_count").notNull().default(0),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    uploadedBy: text("uploaded_by").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    unitIdx: index("files_unit_idx").on(t.unitId),
    typeIdx: index("files_type_idx").on(t.type),
  })
);

// QUESTIONS
export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    unitId: text("unit_id").notNull().references(() => units.id),
    lessonCode: text("lesson_code"),
    questionText: text("question_text").notNull(),
    questionImage: text("question_image"),
    difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default("medium"),
    sourceFileId: text("source_file_id").references(() => files.id),
    sourceQuestionNumber: integer("source_question_number"),
    needsReview: integer("needs_review", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    unitIdx: index("questions_unit_idx").on(t.unitId),
    reviewIdx: index("questions_needs_review_idx").on(t.needsReview),
  })
);

// QUESTION OPTIONS
export const questionOptions = sqliteTable(
  "question_options",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
    order: integer("order").notNull(),
  },
  (t) => ({
    questionIdx: index("question_options_question_idx").on(t.questionId),
  })
);

// QUIZ ATTEMPTS
export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id),
    unitId: text("unit_id").notNull().references(() => units.id),
    questionCount: integer("question_count").notNull(),
    correctCount: integer("correct_count").notNull().default(0),
    scorePercent: real("score_percent"),
    timeSpentSeconds: integer("time_spent_seconds"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => ({
    userIdx: index("quiz_attempts_user_idx").on(t.userId),
    unitIdx: index("quiz_attempts_unit_idx").on(t.unitId),
    completedIdx: index("quiz_attempts_completed_idx").on(t.completedAt),
  })
);

// QUIZ ANSWERS
export const quizAnswers = sqliteTable(
  "quiz_answers",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    attemptId: text("attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull().references(() => questions.id),
    selectedOptionId: text("selected_option_id").references(() => questionOptions.id),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
    answeredAt: integer("answered_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    attemptIdx: index("quiz_answers_attempt_idx").on(t.attemptId),
    questionIdx: index("quiz_answers_question_idx").on(t.questionId),
  })
);

// BOOKMARKS
export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    fileId: text("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index("bookmarks_user_idx").on(t.userId),
    fileIdx: index("bookmarks_file_idx").on(t.fileId),
  })
);

// ANNOUNCEMENTS
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  titleAr: text("title_ar").notNull(),
  bodyAr: text("body_ar").notNull(),
  severity: text("severity", { enum: ["info", "success", "warning", "urgent"] })
    .notNull()
    .default("info"),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

// ACTIVITY LOG
export const activityLog = sqliteTable(
  "activity_log",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").references(() => users.id),
    eventType: text("event_type", {
      enum: [
        "login",
        "signup",
        "file_download",
        "quiz_start",
        "quiz_complete",
        "bookmark_add",
        "page_view",
      ],
    }).notNull(),
    entityId: text("entity_id"),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index("activity_log_user_idx").on(t.userId),
    eventIdx: index("activity_log_event_idx").on(t.eventType),
    createdIdx: index("activity_log_created_idx").on(t.createdAt),
  })
);

// ─── relations ──────────────────────────────────────────────────────────

export const semestersRelations = relations(semesters, ({ many }) => ({
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  semester: one(semesters, { fields: [units.semesterId], references: [semesters.id] }),
  files: many(files),
  questions: many(questions),
  quizAttempts: many(quizAttempts),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  unit: one(units, { fields: [files.unitId], references: [units.id] }),
  uploader: one(users, { fields: [files.uploadedBy], references: [users.id] }),
  bookmarks: many(bookmarks),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  unit: one(units, { fields: [questions.unitId], references: [units.id] }),
  options: many(questionOptions),
  sourceFile: one(files, { fields: [questions.sourceFileId], references: [files.id] }),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  unit: one(units, { fields: [quizAttempts.unitId], references: [units.id] }),
  answers: many(quizAnswers),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  attempt: one(quizAttempts, { fields: [quizAnswers.attemptId], references: [quizAttempts.id] }),
  question: one(questions, { fields: [quizAnswers.questionId], references: [questions.id] }),
  selectedOption: one(questionOptions, {
    fields: [quizAnswers.selectedOptionId],
    references: [questionOptions.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  file: one(files, { fields: [bookmarks.fileId], references: [files.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, { fields: [announcements.createdBy], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
  bookmarks: many(bookmarks),
  announcements: many(announcements),
}));

// ─── type exports ──────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Semester = typeof semesters.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type FileRow = typeof files.$inferSelect;
export type NewFileRow = typeof files.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type ActivityEvent = typeof activityLog.$inferSelect;
