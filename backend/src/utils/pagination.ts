/**
 * Returns safe integer limit and offset for Drizzle .limit() / .offset() calls.
 * Drizzle's neon-http driver handles plain number values correctly.
 *
 * The "Failed query" error is most likely caused by:
 *  1. Missing / incorrect DATABASE_URL in .env
 *  2. Neon project paused (free tier auto-pauses after inactivity)
 *  3. SSL not configured — ensure DATABASE_URL includes ?sslmode=require
 *
 * Usage:
 *   const { limit, offset } = paginate(page, size);
 *   db.select().from(table).limit(limit).offset(offset);
 */
export const paginate = (page: number, size: number): { limit: number; offset: number } => {
    const safeSize = Math.max(1, Math.min(Math.floor(size), 100)); // clamp 1–100
    const safePage = Math.max(1, Math.floor(page));
    return {
        limit: safeSize,
        offset: (safePage - 1) * safeSize,
    };
};