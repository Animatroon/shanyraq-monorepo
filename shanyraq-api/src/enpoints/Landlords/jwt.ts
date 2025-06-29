import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET,JWT_ACCESS_EXPIRES } from "../../config/env";

export interface landlordRequest extends Request {
    landlordId?: string;
    createdAt?: number;
}

export const JWTAccessLandlords = async (req: landlordRequest, res: Response, next: NextFunction) => {
    const accessToken = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if (!accessToken) {
        res.status(401).json({ error: "Требуется авторизация" });
        return;
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET) as landlordRequest;
        if (!decoded.landlordId || !decoded.createdAt) {
            res.status(401).json({message: 'Не валидный токен'})
            return
        } 

        const now = Math.floor(Date.now() / 1000);
        if (decoded.createdAt + JWT_ACCESS_EXPIRES <= now) {
            res.status(401).json({message: 'Срок жизни токена истек'})
            return;
        }
        req.landlordId = decoded.landlordId;
        next()
    }
    catch (e) {
        res.status(500).json({ message: "Ошибка сервера (token)" });
        return;
    }
}