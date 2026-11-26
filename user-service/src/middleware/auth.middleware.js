import { verifyToken } from '../utils/jwt.js';

export function authenticate(req, res, next) {
    const authorization = req.headers.authorization;

    const match = authorization?.match(
        /^Bearer\s+(\S+)$/i
    );

    if (!match) {
        return res.status(401).json({
            code: 'TOKEN_MISSING',
            message: 'Authorization token is required'
        });
    }

    const token = match[1];

    try {
        const decoded = verifyToken(token);

        const isUuid = typeof decoded.sub === 'string'
            && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                .test(decoded.sub);

        if (
            !isUuid ||
            typeof decoded.name !== 'string' ||
            !['OWNER', 'VETERINARIAN'].includes(decoded.role) ||
            !Number.isInteger(decoded.iat) ||
            !Number.isInteger(decoded.exp)
        ) {
            return res.status(401).json({
                code: 'TOKEN_INVALID',
                message: 'Invalid token payload'
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                code: 'TOKEN_EXPIRED',
                message: 'JWT token has expired'
            });
        }

        return res.status(401).json({
            code: 'TOKEN_INVALID',
            message: 'Invalid JWT token'
        });
    }
}

export function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (
            !req.user ||
            !allowedRoles.includes(req.user.role)
        ) {
            return res.status(403).json({
                code: 'ACCESS_DENIED',
                message: 'Insufficient permissions'
            });
        }

        next();
    };
}
export function requireSelf(req, res, next) {
    if (
        !req.user ||
        req.user.sub !== req.params.id
    ) {
        return res.status(403).json({
            code: 'ACCESS_DENIED',
            message: 'You can only manage your own account'
        });
    }

    next();
}