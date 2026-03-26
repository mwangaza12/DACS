import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    getUserNotificationsController,
    markNotificationReadController,
    sendNotificationController,
} from "./notifications.controller";

const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get("/", getUserNotificationsController);
notificationsRouter.put("/:id/read", markNotificationReadController);
notificationsRouter.post("/send", authorize("admin"), sendNotificationController);

export default notificationsRouter;