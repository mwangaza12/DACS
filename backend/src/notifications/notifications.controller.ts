import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import { SendNotificationSchema } from "./notifications.dto";
import {
    getUserNotificationsService,
    markNotificationReadService,
    sendNotificationService,
} from "./notifications.service";

export const getUserNotificationsController = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { page, limit } = req.query as Record<string, string>;
    const data = await getUserNotificationsService(userId, Number(page) || 1, Number(limit) || 20);
    return success(res, data, "Notifications retrieved successfully");
};

export const markNotificationReadController = async (req: Request, res: Response) => {
    const {id} = req.params;
    const updated = await markNotificationReadService(String(id));
    if (!updated) throw new Error("Notification not found");
    return success(res, updated, "Notification marked as read");
};

export const sendNotificationController = async (req: Request, res: Response) => {
    const parsed = SendNotificationSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const notification = await sendNotificationService(parsed.data);
    return success(res, notification, "Notification sent successfully", 201);
};