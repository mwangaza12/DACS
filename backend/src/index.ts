import express from "express";
import type { Request, Response } from "express";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { logger } from "./middlewares/logger";
dotenv.config();

const PORT= process.env.PORT || 5000;
const db = drizzle({connection: process.env.DATABASE_URL!, casing: 'snake_case'});
const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (req, res: Response) => {
    res.json({
        "appName": "Doctor Apointment Computer System",
        "Developer": "Joseph Mwangaza"
    });
})

app.listen(PORT, () => {
    console.log(`DACS running on http://localhost:${PORT}`);
})