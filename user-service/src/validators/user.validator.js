import { z } from 'zod';

export const userIdSchema = z.string().uuid(
    'Invalid user ID'
);

export const updateUserSchema = z.object({
    name: z.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    phone: z.string()
        .trim()
        .min(5)
        .max(30)
        .nullable()
        .optional(),

    avatarUrl: z.string()
        .url('Invalid avatar URL')
        .max(2048)
        .refine(
            value => value.startsWith('https://'),
            'Avatar URL must use HTTPS'
        )
        .nullable()
        .optional()

}).strict().refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided'
);

export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1)
        .refine(
            value => Buffer.byteLength(value, 'utf8') <= 72,
            'Password is too long'
        ),

    newPassword: z.string()
        .min(8)
        .refine(
            value => Buffer.byteLength(value, 'utf8') <= 72,
            'Password must not exceed 72 bytes'
        )

}).strict().refine(
    data => data.currentPassword !== data.newPassword,
    {
        message: 'New password must be different',
        path: ['newPassword']
    }
);