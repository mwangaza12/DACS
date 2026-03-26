import { Router } from "express";
import {
    registerUserController,
    loginController,
    refreshTokenController,
    logoutController,
    forgotPasswordController,
} from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", registerUserController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshTokenController);
authRouter.post("/logout", logoutController);
authRouter.post("/forgot-password", forgotPasswordController);

export default authRouter;