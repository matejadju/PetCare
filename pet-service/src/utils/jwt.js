import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function verifyToken(token) {
    return jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    });
}