import type { NextFunction, Request, Response } from "express";

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (now > entry.resetAt) {
			store.delete(key);
		}
	}
}, 60_000).unref();

export function rateLimiter(options: {
	windowMs: number;
	maxRequests: number;
	message?: string;
}) {
	const {
		windowMs,
		maxRequests,
		message = "Quá nhiều yêu cầu, vui lòng thử lại sau",
	} = options;

	return (req: Request, res: Response, next: NextFunction): void => {
		// Use user ID if authenticated, otherwise IP
		const key = (req as any).user?.userId || req.ip || "unknown";
		const now = Date.now();

		let entry = store.get(key);

		if (!entry || now > entry.resetAt) {
			entry = { count: 1, resetAt: now + windowMs };
			store.set(key, entry);
			next();
			return;
		}

		entry.count++;

		if (entry.count > maxRequests) {
			const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
			res.set("Retry-After", String(retryAfter));
			res.status(429).json({
				success: false,
				message,
			});
			return;
		}

		next();
	};
}

// Pre-configured rate limiters
export const paymentRateLimiter = rateLimiter({
	windowMs: 60_000, // 1 minute
	maxRequests: 5, // 5 payment requests per minute
	message: "Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau 1 phút",
});

export const orderRateLimiter = rateLimiter({
	windowMs: 60_000, // 1 minute
	maxRequests: 10, // 10 order requests per minute
	message: "Quá nhiều yêu cầu đặt hàng, vui lòng thử lại sau 1 phút",
});
