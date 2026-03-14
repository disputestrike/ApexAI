/**
 * Test Database Setup for ApexAI
 * Uses SQLite in-memory for fast, isolated testing
 * No external dependencies, all data reset between tests
 */

import { drizzle, BetterSqlite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import {
  activityLogs,
  campaigns,
  leads,
  users,
  templates,
  testimonials,
  messages,
  campaignContacts,
  callRecordings,
  onboardings,
  analyticsSnapshots,
  systemConfig,
} from "../drizzle/schema";

let testDb: BetterSqlite3Database | null = null;

/**
 * Initialize an in-memory test database
 * Creates all tables and seeds with test data
 */
export function initializeTestDb(): BetterSqlite3Database {
  const db = new Database(":memory:");
  const drizzleDb = drizzle(db);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create tables manually (since migrations are SQL)
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      industry TEXT,
      title TEXT,
      linkedinUrl TEXT,
      website TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      source TEXT,
      notes TEXT,
      score INTEGER DEFAULT 0,
      segment TEXT DEFAULT 'cold',
      status TEXT DEFAULT 'new',
      verificationStatus TEXT DEFAULT 'unverified',
      tags TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft',
      channels TEXT,
      dailyLimit INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      deletedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      featured BOOLEAN DEFAULT 0,
      deletedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaignId INTEGER NOT NULL,
      leadId INTEGER NOT NULL,
      body TEXT NOT NULL,
      channel TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id),
      FOREIGN KEY (leadId) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS campaignContacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaignId INTEGER NOT NULL,
      leadId INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id),
      FOREIGN KEY (leadId) REFERENCES leads(id),
      UNIQUE(campaignId, leadId)
    );

    CREATE TABLE IF NOT EXISTS callRecordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leadId INTEGER NOT NULL,
      url TEXT,
      transcript TEXT,
      duration INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leadId) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS onboardings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      step TEXT,
      completed BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS analyticsSnapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaignId INTEGER NOT NULL,
      sends INTEGER DEFAULT 0,
      opens INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id)
    );

    CREATE TABLE IF NOT EXISTS activityLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      entityType TEXT,
      entityId INTEGER,
      action TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS systemConfig (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Execute schema creation
  db.exec(schema);

  testDb = drizzleDb;
  return drizzleDb;
}

/**
 * Get or initialize test database
 */
export function getTestDb(): BetterSqlite3Database {
  if (!testDb) {
    testDb = initializeTestDb();
  }
  return testDb;
}

/**
 * Reset database (clear all data)
 */
export function resetTestDb(): void {
  if (testDb) {
    const db = testDb._.client as Database.Database;
    db.exec(`
      DELETE FROM messages;
      DELETE FROM campaignContacts;
      DELETE FROM callRecordings;
      DELETE FROM analyticsSnapshots;
      DELETE FROM activityLogs;
      DELETE FROM onboardings;
      DELETE FROM testimonials;
      DELETE FROM templates;
      DELETE FROM campaigns;
      DELETE FROM leads;
      DELETE FROM systemConfig;
      DELETE FROM users;
    `);
  }
}

/**
 * Cleanup test database
 */
export function closeTestDb(): void {
  if (testDb) {
    const db = testDb._.client as Database.Database;
    db.close();
    testDb = null;
  }
}

/**
 * Seed test data
 */
export async function seedTestData() {
  const db = getTestDb();

  // Create test user
  await db.insert(users).values({
    openId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "oauth",
  });

  // Create test leads
  const leadIds = [];
  for (let i = 0; i < 5; i++) {
    const result = await db.insert(leads).values({
      userId: 1,
      firstName: `Lead${i}`,
      lastName: `Test${i}`,
      email: `lead${i}@example.com`,
      phone: `555-000${i}`,
      company: `Company${i}`,
      title: i === 0 ? "CEO" : i === 1 ? "VP" : "Manager",
      score: 50 + i * 10,
      segment: i < 2 ? "hot" : i < 4 ? "warm" : "cold",
      status: "new",
    });
    leadIds.push(result[0]);
  }

  // Create test campaign
  await db.insert(campaigns).values({
    userId: 1,
    name: "Test Campaign",
    description: "A test campaign for validation",
    status: "draft",
    channels: JSON.stringify(["email", "sms"]),
    dailyLimit: 100,
  });

  // Create test template
  await db.insert(templates).values({
    userId: 1,
    name: "Test Template",
    subject: "Hello {{firstName}}",
    body: "Hi {{firstName}} {{lastName}}, welcome to our platform!",
  });

  // Create test testimonial
  await db.insert(testimonials).values({
    userId: 1,
    author: "John Doe",
    content: "ApexAI changed our outbound game!",
    featured: true,
  });

  return { leadIds };
}
