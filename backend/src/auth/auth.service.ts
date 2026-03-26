import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../db/schema";
import { InsertUserType, SelectUserType } from "./auth.dto";

export const registerUserService = async (userData: InsertUserType): Promise<SelectUserType> => {
    const [user] = await db.insert(users).values(userData).returning();

    if (!user) throw new Error("User not registered");

    const { password: _, ...safeUser } = user;
    return safeUser as SelectUserType;
};

export const getUserByEmailService = async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
};

export const getUserByIdService = async (userId: string) => {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user ?? null;
};