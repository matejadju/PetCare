import 'dotenv/config';

const secret = process.env.JWT_SECRET;

if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error(
        'JWT_SECRET must contain at least 32 bytes'
    );
}

export const jwtConfig = Object.freeze({
    secret,
    issuer: process.env.JWT_ISSUER || 'petcare-user-service',
    audience: process.env.JWT_AUDIENCE || 'petcare-api',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256'
});