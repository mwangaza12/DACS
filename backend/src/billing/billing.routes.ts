import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    getAllBillsController,
    getBillByIdController,
    getInsuranceClaimsController,
    processPaymentController,
    updateBillController,
} from "./billing.controller";

const billingRouter = Router();

billingRouter.use(authenticate);

// NOTE: /insurance-claims must come before /:id to avoid route conflict
billingRouter.get("/insurance-claims", authorize("admin"), getInsuranceClaimsController);
billingRouter.get("/", getAllBillsController);
billingRouter.get("/:id", getBillByIdController);
billingRouter.put("/:id", authorize("admin"), updateBillController);
billingRouter.post("/:id/pay", processPaymentController);

export default billingRouter;