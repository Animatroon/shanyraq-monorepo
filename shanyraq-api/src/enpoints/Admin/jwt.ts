import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET,JWT_ACCESS_EXPIRES } from "../../config/env";

export interface adminRequest extends Request {
    adminId?: string;
    createdAt?: number;
}

export const JWTAccessAdmin = async (req: adminRequest, res: Response, next: NextFunction) => {
    const accessToken = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if (!accessToken) {
        res.status(401).json({ error: "Требуется авторизация" });
        return;
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET) as { adminId?: string; createdAt: number };
        if (!decoded.adminId) {
            res.status(401).json({message: 'у вас нет доступа'})
            return
        }
        
        const now = Math.floor(Date.now() / 1000);
        if (decoded.createdAt + JWT_ACCESS_EXPIRES <= now) {
            res.status(401).json('срок жизни токена истек')
            return;
        }
        req.adminId = decoded.adminId;
        next()
    }
    catch (e) {
        res.status(500).json({ message: "Ошибка сервера (token)" });
        return;
    }
}

