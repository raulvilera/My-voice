import { int, mysqlEnum, mysqlTable, 
text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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

/**
 * Tabela de aulas (cursos/modulos)
 */
export const aulas = mysqlTable("aulas", {
  id: int("id").autoincrement().primaryKey(),
  numero: int("numero").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  tag: varchar("tag", { length: 100 }),
  publicada: int("publicada").default(0).notNull(),
  imagemUrl: text("imagemUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aula = typeof aulas.$inferSelect;
export type InsertAula = typeof aulas.$inferInsert;

/**
 * Tabela de secoes dentro das aulas (dialogo, verbos, vocabulario, exercicios)
 */
export const secoes = mysqlTable("secoes", {
  id: int("id").autoincrement().primaryKey(),
  aulaId: int("aulaId").notNull().references(() => aulas.id),
  tipo: mysqlEnum("tipo", ["dialogo", "verbos", "vocabulario", "exercicios"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  ordem: int("ordem").notNull(),
  conteudo: text("conteudo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Secao = typeof secoes.$inferSelect;
export type InsertSecao = typeof secoes.$inferInsert;

/**
 * Tabela de videos explicativos das secoes
 * Professores podem gravar, editar e publicar videos vinculados a cada secao
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  secaoId: int("secaoId").notNull().references(() => secoes.id),
  professorId: int("professorId").notNull().references(() => users.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  videoUrl: text("videoUrl").notNull(),
  videoKey: varchar("videoKey", { length: 255 }).notNull(),
  duracao: int("duracao"),
  thumbnail: text("thumbnail"),
  publicado: int("publicado").default(0).notNull(),
  visualizacoes: int("visualizacoes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Tabela de metadados de edicao de video (rascunhos)
 * Armazena informacoes sobre cortes, volume, legendas antes da publicacao final
 */
export const videoEdits = mysqlTable("videoEdits", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").references(() => videos.id),
  professorId: int("professorId").notNull().references(() => users.id),
  originalVideoUrl: text("originalVideoUrl"),
  editedVideoUrl: text("editedVideoUrl"),
  cuts: text("cuts"),
  volume: int("volume").default(100),
  legenda: text("legenda"),
  status: mysqlEnum("status", ["rascunho", "processando", "concluido", "erro"]).default("rascunho").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoEdit = typeof videoEdits.$inferSelect;
export type InsertVideoEdit = typeof videoEdits.$inferInsert;
