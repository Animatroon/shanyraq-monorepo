import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET,JWT_ACCESS_EXPIRES } from '../config/env';

export interface userRequest extends Request {
    userId?: string;
    landlordsId?: string;
    tenantsId?: string;
    createdAt?: number;
}

export const JWTAccessUser = async (req: userRequest, res: Response, next: NextFunction) => {
    const accessToken = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if (!accessToken) {
        res.status(401).json({ error: "Требуется авторизация" });
        return;
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET) as userRequest;

        if (!decoded.createdAt) {
            res.status(500).json({ message: "Ошибка сервера (token)" });
            return;
        }

        if (decoded.landlordsId) {
            
            const now = Math.floor(Date.now() / 1000);
            if (decoded.createdAt + JWT_ACCESS_EXPIRES <= now) {
                res.status(401).json({message: 'срок жизни токена истек'})
                return;
            }
            req.landlordsId = decoded.landlordsId;
            req.userId = decoded.landlordsId;

            next()
        }
        else if (decoded.tenantsId) {
            const now = Math.floor(Date.now() / 1000);
            if (decoded.createdAt + JWT_ACCESS_EXPIRES <= now) {
                res.status(401).json({message: 'срок жизни токена истек'})
                return;
            }
            req.tenantsId = decoded.tenantsId;
            req.userId = decoded.tenantsId;
            next()
        }

        res.status(401).json({message: 'у вас нет доступа'})
        return

    }
    catch (e) {
        res.status(500).json({ message: "Ошибка сервера (token)" });
        return;
    }
}