import {
  int,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  company: varchar("company", { length: 200 }),
  industry: varchar("industry", { length: 100 }),
  title: varchar("title", { length: 150 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  website: varchar("website", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  score: int("score").default(0).notNull(),
  segment: mysqlEnum("segment", ["hot", "warm", "cold", "unqualified"]).default("cold").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["verified", "unverified", "bounced", "pending"]).default("pending").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  source: varchar("source", { length: 100 }),
  notes: text("notes"),
  tags: text("tags"),
  customFields: text("customFields"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_leads_score").on(t.score),
  index("idx_leads_segment").on(t.segment),
  index("idx_leads_status").on(t.status),
  index("idx_leads_verification").on(t.verificationStatus),
  index("idx_leads_created_at").on(t.createdAt),
]);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Templates ────────────────────────────────────────────────────────────────
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  channel: mysqlEnum("channel", ["sms", "email", "voice", "social"]).notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  variables: text("variables"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  channels: text("channels"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "archived"]).default("draft").notNull(),
  goal: mysqlEnum("goal", ["appointments", "demos", "sales", "awareness", "follow_up"]).default("appointments").notNull(),
  industry: varchar("industry", { length: 100 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  dailyLimit: int("dailyLimit").default(50),
  totalContacts: int("totalContacts").default(0),
  sentCount: int("sentCount").default(0),
  responseCount: int("responseCount").default(0),
  scheduledCount: int("scheduledCount").default(0),
  showCount: int("showCount").default(0),
  convertedCount: int("convertedCount").default(0),
  revenueGenerated: float("revenueGenerated").default(0),
  settings: text("settings"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_campaigns_status").on(t.status),
  index("idx_campaigns_created_at").on(t.createdAt),
]);

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── Campaign Contacts ────────────────────────────────────────────────────────
export const campaignContacts = mysqlTable("campaign_contacts", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  leadId: int("leadId").notNull(),
  status: mysqlEnum("status", ["pending", "contacted", "responded", "scheduled", "showed", "converted", "failed", "opted_out"]).default("pending").notNull(),
  channel: mysqlEnum("channel", ["sms", "email", "voice", "social"]),
  lastContactedAt: timestamp("lastContactedAt"),
  nextContactAt: timestamp("nextContactAt"),
  attempts: int("attempts").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_campaign_contacts_campaign_id").on(t.campaignId),
  index("idx_campaign_contacts_lead_id").on(t.leadId),
]);

export type CampaignContact = typeof campaignContacts.$inferSelect;

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId"),
  leadId: int("leadId").notNull(),
  channel: mysqlEnum("channel", ["sms", "email", "voice", "social"]).notNull(),
  direction: mysqlEnum("direction", ["outbound", "inbound"]).default("outbound").notNull(),
  status: mysqlEnum("status", ["queued", "sent", "delivered", "read", "replied", "failed", "bounced"]).default("queued").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  templateId: int("templateId"),
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  readAt: timestamp("readAt"),
  repliedAt: timestamp("repliedAt"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("idx_messages_campaign_id").on(t.campaignId),
  index("idx_messages_lead_id").on(t.leadId),
  index("idx_messages_created_at").on(t.createdAt),
]);

export type Message = typeof messages.$inferSelect;

// ─── Call Recordings ──────────────────────────────────────────────────────────
export const callRecordings = mysqlTable("call_recordings", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  campaignId: int("campaignId"),
  messageId: int("messageId"),
  duration: int("duration").default(0),
  status: mysqlEnum("status", ["completed", "no_answer", "voicemail", "failed", "busy"]).default("completed").notNull(),
  outcome: mysqlEnum("outcome", ["interested", "not_interested", "callback", "scheduled", "voicemail", "no_answer"]).default("no_answer").notNull(),
  transcript: text("transcript"),
  recordingUrl: varchar("recordingUrl", { length: 1000 }),
  aiSummary: text("aiSummary"),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]),
  scheduledAppointment: boolean("scheduledAppointment").default(false),
  calledAt: timestamp("calledAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallRecording = typeof callRecordings.$inferSelect;

// ─── Analytics Snapshots ──────────────────────────────────────────────────────
export const analyticsSnapshots = mysqlTable("analytics_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId"),
  date: timestamp("date").defaultNow().notNull(),
  totalContacts: int("totalContacts").default(0),
  totalSent: int("totalSent").default(0),
  totalResponses: int("totalResponses").default(0),
  totalScheduled: int("totalScheduled").default(0),
  totalShowed: int("totalShowed").default(0),
  totalConverted: int("totalConverted").default(0),
  responseRate: float("responseRate").default(0),
  scheduleRate: float("scheduleRate").default(0),
  showRate: float("showRate").default(0),
  conversionRate: float("conversionRate").default(0),
  revenueGenerated: float("revenueGenerated").default(0),
  costPerLead: float("costPerLead").default(0),
  roi: float("roi").default(0),
  channel: mysqlEnum("channel", ["sms", "email", "voice", "social", "all"]).default("all"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  company: varchar("company", { length: 200 }),
  quote: text("quote").notNull(),
  beforeMetric: varchar("beforeMetric", { length: 500 }),
  afterMetric: varchar("afterMetric", { length: 500 }),
  specificResult: varchar("specificResult", { length: 500 }),
  resultValue: varchar("resultValue", { length: 200 }),
  avatarUrl: varchar("avatarUrl", { length: 1000 }),
  isActive: boolean("isActive").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardings = mysqlTable("onboardings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  setupDay: timestamp("setupDay"),
  supportEndDate: timestamp("supportEndDate"),
  completedSteps: text("completedSteps"),
  notes: text("notes"),
  specialistName: varchar("specialistName", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => [
  index("idx_onboardings_user_id").on(t.userId),
]);

export type Onboarding = typeof onboardings.$inferSelect;
export type InsertOnboarding = typeof onboardings.$inferInsert;

// ─── Activity Log ─────────────────────────────────────────────────────────────
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => [
  index("idx_activity_logs_user_id").on(t.userId),
  index("idx_activity_logs_entity").on(t.entityType, t.entityId),
]);

export type ActivityLog = typeof activityLogs.$inferSelect;

// ─── System Config ────────────────────────────────────────────────────────────
export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SystemConfig = typeof systemConfig.$inferSelect;
