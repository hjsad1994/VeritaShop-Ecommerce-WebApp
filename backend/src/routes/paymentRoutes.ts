import { Router } from "express";
import { paymentController } from "../controllers/PaymentController";
import { authenticate } from "../middleware/auth";
import { paymentRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Create MoMo payment (requires authentication)
router.post(
	"/momo/create",
	authenticate,
	paymentRateLimiter,
	paymentController.createMomoPayment,
);

// MoMo IPN callback (no auth - called by MoMo server)
router.post("/momo/ipn", paymentController.handleMomoIPN);

// MoMo return URL (no auth - user redirect from MoMo)
router.get("/momo/return", paymentController.handleMomoReturn);

// Get payment status (requires authentication)
router.get(
	"/status/:orderId",
	authenticate,
	paymentController.getPaymentStatus,
);

export default router;
