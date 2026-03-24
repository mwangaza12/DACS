import { timestamp, uuid, pgTable, pgEnum, boolean, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("role", ["patient", "admin", "doctor"]);

export const users = pgTable("users",{
    user_id: uuid().primaryKey().defaultRandom(),
    email: varchar({length: 255}).notNull().unique(),
    phone: varchar({length: 20}),
    password: varchar({length: 255}).notNull(),
    role: userRoleEnum().notNull().default("patient"),
    is_active: boolean().default(true).notNull(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
});