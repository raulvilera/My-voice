import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, videos, InsertVideo } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ────────────────────────────────────────────────────────────
// Video Queries
// ────────────────────────────────────────────────────────────

export async function getVideosBySecaoId(secaoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.secaoId, secaoId))
    .orderBy(videos.createdAt);
  
  return result;
}

export async function getVideoById(videoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(videos).values(data);
  return result;
}

export async function updateVideo(videoId: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(videos)
    .set(data)
    .where(eq(videos.id, videoId));
  
  return result;
}

export async function deleteVideo(videoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .delete(videos)
    .where(eq(videos.id, videoId));
  
  return result;
}

export async function incrementVideoViews(videoId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(videos)
    .set({ visualizacoes: sql`${videos.visualizacoes} + 1` })
    .where(eq(videos.id, videoId));
}

// TODO: add feature queries here as your schema grows.
