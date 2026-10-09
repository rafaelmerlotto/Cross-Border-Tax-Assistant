import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request } from 'express';

export const globalLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 m
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Please try again later.',
        retryAfter: '15 minutes',
    },
    skip: (req: Request) => req.method === 'OPTIONS',
});

export const pdfGenerationLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 60 * 1000,   // 5 h
    limit: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'PDF generation limit reached. Please wait before requesting another PDF.',
        retryAfter: '5 hours',
    },
});

export const consultationCreationLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 5 * 60 * 60 * 1000,   // 5 h
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'Too many consultations created. Please wait before starting a new one.',
        retryAfter: '5 hours',
    },
});