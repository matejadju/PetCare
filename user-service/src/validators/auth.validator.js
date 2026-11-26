import { z } from 'zod';

const emailSchema = z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(255);

const passwordSchema = z.string()
    .min(8, 'Password must contain at least 8 characters')
    .refine(
        value => Buffer.byteLength(value, 'utf8') <= 72,
        'Password must not exceed 72 bytes'
    );

export const registerSchema = z.object({
    name: z.string()
        .trim()
        .min(2, 'Name must contain at least 2 characters')
        .max(100),

    email: emailSchema,

    password: passwordSchema,

    phone: z.string()
        .trim()
        .min(5)
        .max(30)
        .optional()
}).strict();

export const loginSchema = z.object({
    email: emailSchema,

    password: z.string()
        .min(1, 'Password is required')
        .refine(
            value => Buffer.byteLength(value, 'utf8') <= 72,
            'Password is too long'
        )
}).strict();