// src/enpoints/Admin/constroller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { bindMethods } from "../../BindMethonds";
import { Admin } from "../../DB/Schems/admin/admin";
import { RefreshAdmin } from "../../DB/Schems/admin/refresh-admin";
import { adminRequest } from "./jwt";
import { Tenant, ITenant } from "../../DB/Schems/Tenants/tenant";
import { Landlord, ILandlord } from "../../DB/Schems/Landlords/landlord";
import { Blacklist, BlacklistType } from "../../DB/Schems/admin/blacklist";
import { House } from "../../DB/Schems/Landlords/house"; // Убедись, что путь правильный
import { ClientType } from "../../DB/Schems/chat/admin/chatAdmin";
import { ChatAdmin } from "../../DB/Schems/chat/admin/chatAdmin";
import { MessageAdmin, AdminSenderType } from "../../DB/Schems/chat/admin/messageAdmin";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from "../../config/env";

export class AdminController {
    constructor() { bindMethods(this); }

    private createAccsess(id: string): string {
        const access = jwt.sign(
            { adminId: id, createdAt: Math.floor(Date.now() / 1000) },
            JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES }
        );
        return access;
    }

    private createTokens(adminId: string): { access: string, refresh: string } {
        const access = this.createAccsess(adminId);
        const refresh = jwt.sign(
            { adminId: adminId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES }
        );
        return { access, refresh };
    }

    // --- Login / Refresh / Logout ---
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { login, password } = req.body;
            // Ищем админа и явно запрашиваем пароль
            const user = await Admin.findOne({ email: login }).select('+password');

            if (!user) {
                res.status(400).json({ message: 'Неверный логин или пароль' });
                return;
            }
            // Проверяем, что пароль действительно есть (после select)
            if (!user.password) {
                console.error(`Admin ${user._id} has no password in DB.`);
                res.status(500).json({ message: 'Ошибка конфигурации аккаунта администратора' });
                return;
            }

            const isHash = await bcrypt.compare(password, user.password); // Используем async compare
            if (!isHash) {
                res.status(400).json({ message: 'Неверный логин или пароль' });
                return;
            }

            const { access, refresh } = this.createTokens(user._id.toString());
            res.cookie("refresh", refresh, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production'
            });

            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const userAgent = req.headers["user-agent"] || 'unknown';

            await RefreshAdmin.create({
                adminId: user._id, token: refresh,
                ipAdress: Array.isArray(ip) ? ip[0] : ip, device: userAgent
            });

            res.json({ access: access });
        } catch (error) {
            console.error("Admin Login Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при входе';
            res.status(500).json({ message });
        }
    }

    public async refresh(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refresh;
            if (!refreshToken) {
                res.status(401).json({ message: 'Отсутствует refresh токен' }); return;
            }

            let decoded: any;
            try {
                decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            } catch (err) {
                 res.status(401).json({ message: 'Невалидный или истекший refresh токен' }); return;
            }

            const adminId = decoded.adminId;
            if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
                 res.status(401).json({ message: 'Невалидный токен: неверный ID администратора' }); return;
            }

            const tokenExists = await RefreshAdmin.findOne({ adminId: adminId, token: refreshToken, isActive: true });
            if (!tokenExists) {
                res.status(401).json({ message: 'Токен не найден или неактивен' }); return;
            }

            const accessToken = this.createAccsess(adminId);
            res.status(200).json({ access: accessToken });

        } catch (error) {
            console.error("Admin Refresh Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при обновлении токена';
            res.status(500).json({ message });
        }
    }

     public async logout(req: adminRequest, res: Response): Promise<void> {
         try {
             const refreshToken = req.cookies.refresh;
             if (refreshToken) {
                 await RefreshAdmin.deleteOne({ token: refreshToken });
             }
             res.clearCookie('refresh', { httpOnly: true, secure: process.env.NODE_ENV === 'production'});
             res.status(200).json({ message: 'Выход выполнен успешно' });
         } catch (error) {
             console.error("Admin Logout Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при выходе';
             res.status(500).json({ message });
         }
     }

    // --- User Management ---
    public async getTenants(req: adminRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const totalTenants = await Tenant.countDocuments();
            const tenants = await Tenant.find() // password уже исключен схемой
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            res.json({ tenants, currentPage: page, totalPages: Math.ceil(totalTenants / limit), totalTenants });
        } catch (error) {
            console.error("Get Tenants Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении арендаторов';
            res.status(500).json({ message });
        }
    }

    public async getLandlords(req: adminRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const totalLandlords = await Landlord.countDocuments();
            const landlords = await Landlord.find() 
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            res.json({ landlords, currentPage: page, totalPages: Math.ceil(totalLandlords / limit), totalLandlords });
        } catch (error) {
            console.error("Get Landlords Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при получении арендодателей';
             res.status(500).json({ message });
        }
    }

    // --- ИСПРАВЛЕННЫЙ blacklistUser ---
    public async blacklistUser(req: adminRequest, res: Response): Promise<void> {
        try {
            const { userId, userType, reason } = req.body;

            if (!userId || !userType || !mongoose.Types.ObjectId.isValid(userId)) {
                 res.status(400).json({ message: 'Необходим валидный userId и userType' }); return;
            }

            let user: (ITenant & mongoose.Document) | (ILandlord & mongoose.Document) | null = null;

            // --- Ищем пользователя в соответствующей коллекции ---
            if (userType === 'tenant') {
                user = await Tenant.findById(userId);
            } else if (userType === 'landlord') {
                user = await Landlord.findById(userId);
            } else {
                 res.status(400).json({ message: 'Неверный userType (ожидается tenant или landlord)' }); return;
            }
            // --- Конец поиска ---

            if (!user) {
                 res.status(404).json({ message: 'Пользователь не найден' }); return;
            }

            // Используем isBlacklisted
            if (user.isBlacklisted) {
                 res.status(400).json({ message: 'Пользователь уже в черном списке' }); return;
            }

            // Проверяем наличие email и iin (используем iin)
            if (!user.email || !user.iin) {
                console.error(`User ${userType} ${userId} is missing email or iin.`);
                res.status(500).json({ message: 'Ошибка данных пользователя: отсутствует email или ИИН.' }); return;
            }

            await Blacklist.insertMany([
                { value: user.email, type: BlacklistType.EMAIL, reason },
                { value: user.iin, type: BlacklistType.IIN, reason }, // Используем iin
            ], { ordered: false }).catch(err => {
                if (err.code !== 11000) console.error("Blacklist insert error:", err);
            });

            // Используем isBlacklisted и blacklistReason
            user.isBlacklisted = true;
            user.blacklistReason = reason;
            await user.save();

            // Возвращаем пользователя без пароля
            const userResponse = user.toObject();
            // @ts-ignore // Игнорируем ошибку TS, т.к. password исключен схемой или не нужен
            delete userResponse.password;
            res.json({ message: 'Пользователь добавлен в черный список', user: userResponse });

        } catch (error) {
             console.error("Blacklist User Error:", error);
             let message = 'Ошибка сервера при добавлении в черный список';
             let statusCode = 500;
             if (typeof error === 'object' && error !== null && (error as any).code === 11000) {
                 message = 'Email или IIN уже в черном списке';
                 statusCode = 400;
             } else if (error instanceof Error) { message = error.message; }
             res.status(statusCode).json({ message });
        }
    }

     // --- ИСПРАВЛЕННЫЙ unblacklistUser ---
     public async unblacklistUser(req: adminRequest, res: Response): Promise<void> {
        try {
            const { userId, userType } = req.body;

             if (!userId || !userType || !mongoose.Types.ObjectId.isValid(userId)) {
                  res.status(400).json({ message: 'Необходим валидный userId и userType' }); return;
             }

            let user: (ITenant & mongoose.Document) | (ILandlord & mongoose.Document) | null = null;

            // --- Ищем пользователя ---
            if (userType === 'tenant') {
                user = await Tenant.findById(userId);
            } else if (userType === 'landlord') {
                user = await Landlord.findById(userId);
            } else {
                 res.status(400).json({ message: 'Неверный userType' }); return;
            }
            // --- Конец поиска ---

            if (!user) {
                 res.status(404).json({ message: 'Пользователь не найден' }); return;
            }

            // Используем isBlacklisted
            if (!user.isBlacklisted) {
                 res.status(400).json({ message: 'Пользователь не находится в черном списке' }); return;
            }

            // Проверяем email и iin (используем iin)
            if (!user.email || !user.iin) {
                console.warn(`User ${userType} ${userId} is missing email or iin for unblacklist.`);
            }

            // Удаляем из блэклиста, используя email и iin, если они есть
            const valuesToRemove = [user.email, user.iin].filter(Boolean); // Удаляем null/undefined
             if (valuesToRemove.length > 0) {
                 await Blacklist.deleteMany({ value: { $in: valuesToRemove } });
             }


            // Используем isBlacklisted и blacklistReason
            user.isBlacklisted = false;
            user.blacklistReason = undefined;
            await user.save();

            const userResponse = user.toObject();
             // @ts-ignore
            delete userResponse.password;
            res.json({ message: 'Пользователь убран из черного списка', user: userResponse });

        } catch (error) {
            console.error("Unblacklist User Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при удалении из черного списка';
             res.status(500).json({ message });
        }
    }

    // --- House Management ---
    public async getLandlordHouses(req: adminRequest, res: Response): Promise<void> {
        try {
            const landlordId = req.params.landlordId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

             if (!mongoose.Types.ObjectId.isValid(landlordId)) {
                  res.status(400).json({ message: 'Невалидный landlordId' }); return;
             }

            const totalHouses = await House.countDocuments({ landlordId: landlordId });
            const houses = await House.find({ landlordId: landlordId })
                .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            res.json({ houses, currentPage: page, totalPages: Math.ceil(totalHouses / limit), totalHouses });
        } catch (error) {
            console.error("Get Landlord Houses Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при получении домов арендодателя';
             res.status(500).json({ message });
        }
    }

     // --- Admin Creation ---
     public async create(req: adminRequest, res: Response): Promise<void> {
        const { username, surname, newPass, email, isSuperAdmin } = req.body;
        if (!username || !surname || !newPass || !email) {
            res.status(400).json({message: 'Не все поля заполнены'}); return;
        }

        try {
             const existingAdmin = await Admin.findOne({ email });
             if (existingAdmin) {
                  res.status(400).json({ message: 'Администратор с таким email уже существует' }); return;
             }

            const salt = await bcrypt.genSalt(10);
            const hashPass = await bcrypt.hash(newPass, salt);

            const newAdmin = await Admin.create({
                name: username, surname, email, password: hashPass, superadmin: isSuperAdmin || false
            });
            res.status(201).json({ message: 'Администратор создан', user: { /* ... user data ... */ } });
        } catch(error) {
             console.error("Create Admin Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при создании администратора';
             res.status(500).json({message});
        }
    }

    // --- Chat Management ---
    public async getAdminChats(req: adminRequest, res: Response): Promise<void> {
        try {
            const adminId = req.adminId;
            if (!adminId) { res.status(401).json({ message: 'Не удалось определить ID администратора' }); return; }
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 30;
            const skip = (page - 1) * limit;

            const totalChats = await ChatAdmin.countDocuments({ adminId });
            const chats = await ChatAdmin.find({ adminId }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean();

             const populatedChats = await Promise.all(chats.map(async (chat) => {
                 let clientInfo: Partial<ITenant> | Partial<ILandlord> | null = null; // Используем Partial
                 if (chat.clientType === ClientType.TENANT) {
                     clientInfo = await Tenant.findById(chat.clientId).select('firstName lastName email').lean();
                 } else if (chat.clientType === ClientType.LANDLORD) {
                     clientInfo = await Landlord.findById(chat.clientId).select('firstName lastName email').lean();
                 }
                 const lastMessage = await MessageAdmin.findOne({ chatId: chat._id }).sort({ createdAt: -1 }).lean();

                 return {
                     _id: chat._id, adminId: chat.adminId, clientId: chat.clientId, clientType: chat.clientType,
                     clientName: clientInfo ? `${clientInfo.firstName || ''} ${clientInfo.lastName || ''}`.trim() : 'Клиент не найден',
                     clientEmail: clientInfo?.email,
                     lastMessage: lastMessage ? { text: lastMessage.text, createdAt: lastMessage.createdAt, senderType: lastMessage.senderType } : null,
                     createdAt: chat.createdAt, updatedAt: chat.updatedAt
                 };
             }));
            res.json({ chats: populatedChats, currentPage: page, totalPages: Math.ceil(totalChats / limit), totalChats });
        } catch(error) {
            console.error("Get Admin Chats Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении чатов';
            res.status(500).json({ message });
        }
    }

    public async getAdminChatMessages(req: adminRequest, res: Response): Promise<void> {
        try {
            const adminId = req.adminId;
             if (!adminId) { res.status(401).json({ message: 'Не удалось определить ID администратора' }); return; }
            const chatId = req.params.chatId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const skip = (page - 1) * limit;

            if (!mongoose.Types.ObjectId.isValid(chatId)) { res.status(400).json({ message: 'Невалидный chatId' }); return; }

            const chat = await ChatAdmin.findById(chatId).lean(); // Добавляем lean
             if (!chat) { res.status(404).json({ message: 'Админ-чат не найден' }); return; }
             // Опционально: проверка принадлежности чата админу `if (chat.adminId !== adminId)`

            const totalMessages = await MessageAdmin.countDocuments({ chatId: chatId });
            const messages = await MessageAdmin.find({ chatId: chatId }).sort({ createdAt: 1 }) // Сразу сортируем старые -> новые
                                    .skip(skip).limit(limit).lean();

            res.json({
                messages: messages.map(msg => ({ /* ... message data ... */ isMy: msg.senderId.toString() === adminId && msg.senderType === AdminSenderType.ADMIN })),
                currentPage: page, totalPages: Math.ceil(totalMessages / limit), totalMessages
            });
        } catch(error) {
            console.error("Get Admin Chat Messages Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при получении сообщений';
             res.status(500).json({ message });
        }
    }
}

const adminControllerInstance = new AdminController();
export default adminControllerInstance;