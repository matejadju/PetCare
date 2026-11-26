import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function generateToken(user) {
    return jwt.sign(
        {
            name: user.name,
            role: user.role
        },
        jwtConfig.secret,
        {
            subject: user.id,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            expiresIn: jwtConfig.expiresIn,
            algorithm: jwtConfig.algorithm
        }
    );
}

export function verifyToken(token) {
    return jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    });
}