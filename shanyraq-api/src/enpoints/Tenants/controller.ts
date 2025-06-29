// src/enpoints/Tenants/controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Tenant, ITenant } from "../../DB/Schems/Tenants/tenant"; // Убедись, что ITenant импортирован
import { RefreshTenant } from "../../DB/Schems/Tenants/refreshTenant"; // Убедись, что RefreshTenant импортирован и путь правильный
import { Blacklist, BlacklistType } from "../../DB/Schems/admin/blacklist";
import crypt from '../../crypt'; // Убедись, что путь правильный
import { bindMethods } from "../../BindMethonds";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from "../../config/env";
import { tenantRequest } from "./jwt"; // Твой middleware для JWT
import { ReviewTenant, ReviewType } from "../../DB/Schems/Tenants/reviewsTenant"; // Нужен для getUser

export class TenantsController {
    getUser(arg0: string, getUser: any) {
        throw new Error("Method not implemented.");
    } // Убедись, что класс экспортируется правильно

    constructor() {
        bindMethods(this);
    }

     // --- Приватные методы для токенов ---
     private createAccsess(id: string): string {
        const access = jwt.sign(
        { tenantsId: id, createdAt: Math.floor(Date.now() / 1000) }, // Используем tenantsId
        JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES }
        );
        return access;
    }
    private createTokens(tenantId: string):{access: string, refresh: string} {
        const access = this.createAccsess(tenantId);
        const refresh = jwt.sign(
            { tenantsId: tenantId }, // Используем tenantsId
            JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES }
        );
        return { access, refresh };
    }

    // --- Регистрация ---
    public async register(req: Request, res: Response): Promise<void> {
        try {
            const { passwordForbuffer, password, phone, email } = req.body;
            const buffer = req.file;

            if (!buffer) { res.status(400).json({ message: 'ЭЦП файл не загружен' }); return; }
            if (!passwordForbuffer) { res.status(400).json({ message: 'Не указан пароль для ЭЦП' }); return; }
            if (!password) { res.status(400).json({ message: 'Не указан пароль для аккаунта' }); return; }
            if (!phone) { res.status(400).json({ message: 'Не указан телефон' }); return; }
            if (!email) { res.status(400).json({ message: 'Не указан email' }); return; }
             // TODO: Валидация email и phone

            // --- Декодируем ЭЦП ---
            const decodedData = crypt.decodeBuffer(buffer.buffer, passwordForbuffer);
            if (decodedData.error || !decodedData.iin || !decodedData.firstName || !decodedData.lastName) {
                res.status(400).json({ message: decodedData.message || 'Ошибка декодирования ЭЦП или неполные данные' }); return;
            }
            const { firstName, lastName, fatherName, iin } = decodedData; // Используем iin

            // --- Проверка на черный список ---
            const blacklistedEntry = await Blacklist.findOne({ value: { $in: [email, iin] } }).lean();
            if (blacklistedEntry) {
                const type = blacklistedEntry.type === BlacklistType.EMAIL ? 'Email' : 'ИИН';
                res.status(403).json({ message: `${type} в черном списке. Причина: ${blacklistedEntry.reason || 'Не указана'}` });
                return;
            }
            // --- Конец проверки ---

            // --- Проверка на существующего пользователя ---
            // Используем iin (нижний регистр) как в схеме
            const existingTenant = await Tenant.findOne({ $or: [ { email: email }, { phone: phone }, { iin: iin } ] }).lean();
            if (existingTenant) {
                let text = 'Пользователь с такими данными уже существует';
                if (existingTenant.email === email) text = 'Почта уже занята';
                else if (existingTenant.phone === phone) text = 'Телефон уже занят';
                else if (existingTenant.iin === iin) text = 'ИИН уже занят';
                res.status(400).json({ message: text }); return;
            }
            // --- Конец проверки ---

            // Хешируем пароль
            const salt = await bcrypt.genSalt(10);
            const hashPass = await bcrypt.hash(password, salt);

            // Создаем пользователя (используем iin)
            await Tenant.create({
                firstName, lastName, fatherName, iin, phone, email, password: hashPass
            });
            res.status(201).json({ message: 'Регистрация прошла успешно' });

        } catch (error) {
            console.error("Tenant Registration Error:", error);
            let message = 'Ошибка сервера при регистрации'; let statusCode = 500;
            if (typeof error === 'object' && error !== null && (error as any).code === 11000) {
                message = 'Пользователь с таким Email, телефоном или ИИН уже существует.'; statusCode = 400;
            } else if (error instanceof Error) { message = error.message; }
            res.status(statusCode).json({ message });
        }
    }

    // --- Логин ---
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { login, password } = req.body; // login может быть email или phone

            // --- ИСПРАВЛЕНИЕ: Добавляем .select('+password') для получения хэша ---
            const user = await Tenant.findOne({
                $or: [ { email: login }, { phone: login } ]
            }).select('+password');
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

            if (!user) {
                res.status(400).json({ message: 'Неверный логин или пароль' });
                return;
            }

            // --- Проверка на черный список ---
            if (user.isBlacklisted) {
                 res.status(403).json({ message: `Ваш аккаунт заблокирован. Причина: ${user.blacklistReason || 'Не указана'}` });
                 return;
            }
            // --- Конец проверки ---

            // --- ИСПРАВЛЕНИЕ: Проверяем, что пароль действительно был получен из базы ---
            if (!user.password) {
                console.error(`Tenant ${user._id} has no password in DB or select failed.`);
                // Это не ошибка клиента, а проблема на сервере или в данных
                res.status(500).json({ message: 'Ошибка конфигурации аккаунта' });
                return;
            }
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

            // Теперь user.password точно string, можно сравнивать
            // Используем асинхронный bcrypt.compare
            const isHash = await bcrypt.compare(password, user.password);
            if (!isHash) {
                res.status(400).json({ message: 'Неверный логин или пароль' });
                return;
            }

            // --- Генерация токенов и остальная логика ---
            const { access, refresh } = this.createTokens(user._id.toString());
            res.cookie("refresh", refresh, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                // sameSite: 'none', maxAge: JWT_REFRESH_EXPIRES * 1000
            });

            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const userAgent = req.headers["user-agent"] || 'unknown';
            // Используем RefreshTenant для сохранения токена арендатора
            await RefreshTenant.create({
                tenantsId: user._id, token: refresh,
                ipAdress: Array.isArray(ip) ? ip[0] : ip, device: userAgent
            });

            // Возвращаем данные пользователя (без пароля)
            res.json({
                access: access,
                tenant: { // Называем tenant для ясности
                    id: user._id, firstName: user.firstName, lastName: user.lastName,
                    fatherName: user.fatherName, iin: user.iin, // Используем iin
                    email: user.email, phone: user.phone,
                    ava: user.ava ? `/api/Tenant/avatar/${user._id}` : null // Пример URL аватара
                }
            });
            // --- Конец генерации токенов ---

        } catch (error) {
            console.error("Tenant Login Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при входе';
            res.status(500).json({ message });
        }
    }

    // --- Обновление токена ---
    public async refresh(req: tenantRequest, res: Response): Promise<void>{ // tenantRequest из твоего jwt
        try {
            const refreshToken = req.cookies.refresh;
            if (!refreshToken) { res.status(401).json({ message: 'Отсутствует refresh токен' }); return; }

            let decoded: any;
            try { decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET); }
            catch (err) { res.status(401).json({ message: 'Невалидный или истекший refresh токен' }); return; }

            const tenantId = decoded.tenantsId; // Проверяем tenantsId
            if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
                 res.status(401).json({ message: 'Невалидный токен: неверный ID арендатора' }); return;
            }

            // Проверяем токен в базе RefreshTenant
            const tokenExists = await RefreshTenant.findOne({ tenantsId: tenantId, token: refreshToken, isActive: true });
            if (!tokenExists) { res.status(401).json({ message: 'Токен не найден или неактивен' }); return; }

            const accessToken = this.createAccsess(tenantId);
            res.status(200).json({ access: accessToken }); // Отправляем access

        } catch (error) {
            console.error("Tenant Refresh Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при обновлении токена';
            res.status(500).json({ message });
        }
    }

    // --- Получение информации о себе ---
    public async getInfoUser(req: tenantRequest, res: Response): Promise<void> { // tenantRequest из jwt
        try {
            const tenantId = req.tenantId;
            if (!tenantId) { res.status(401).json({message: 'Не удалось определить пользователя' }); return; }

            const tenant = await Tenant.findById(tenantId).lean();
            if (!tenant) { res.status(404).json({message: 'Арендатор не найден'}); return; }

            res.json({
                tenant: {
                    id: tenant._id, firstName: tenant.firstName, lastName: tenant.lastName,
                    fatherName: tenant.fatherName, iin: tenant.iin,
                    email: tenant.email, phone: tenant.phone,
                    ava: tenant.ava ? `/api/Tenant/avatar/${tenant._id}` : null
                }
            });

        } catch (error) {
            console.error("Get Tenant Info Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера';
            res.status(500).json({ message });
        }
    }

    // --- Получение списка арендаторов (публично или для админа?) ---
    // Уточни, кто должен иметь доступ к этому списку
    public async getUserListForPublic(req: Request, res: Response): Promise<void> { // Обычный Request
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            const totalTenants = await Tenant.countDocuments();
            const tenants = await Tenant.find()
                .select('firstName lastName fatherName email phone iin ava') // Выбираем поля
                .skip(skip).limit(limit).lean();

             // Получаем рейтинг для каждого (если нужно)
            const finalTenants = await Promise.all(tenants.map(async (tenant) => {
                 // Рейтинг арендатора обычно оставляют арендодатели (нужна схема ReviewLandlord)
                 // const reviews = await ReviewLandlord.find({ tenantsId: tenant._id });
                 // const avgRating = ... подсчет среднего ...
                 return {
                     id: tenant._id, firstName: tenant.firstName, lastName: tenant.lastName, fatherName: tenant.fatherName,
                     email: tenant.email, phone: tenant.phone, iin: tenant.iin,
                     ava: tenant.ava ? `/api/Tenant/avatar/${tenant._id}` : null,
                     // averageRating: avgRating || null
                 };
             }));

            res.json({ tenants: finalTenants, currentPage: page, totalPages: Math.ceil(totalTenants / limit), totalTenants });

        } catch (error) {
            console.error("Get Tenant List Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера';
            res.status(500).json({ message });
        }
    }

    // --- Обновление своего профиля ---
    public async updateUser(req: tenantRequest, res: Response): Promise<void> { // tenantRequest из jwt
        const tenantId = req.tenantId;
         if (!tenantId) { res.status(401).json({message: 'Не удалось определить пользователя'}); return; }

        const { phone, email } = req.body;
        const avaFile = req.file;

        const updatedData: Partial<ITenant> = {};
        if (phone && typeof phone === 'string') updatedData.phone = phone.trim();
        if (email && typeof email === 'string') updatedData.email = email.trim().toLowerCase();
        if (avaFile) updatedData.ava = avaFile.buffer;

        if (Object.keys(updatedData).length === 0) {
            res.status(400).json({ message: 'Нет данных для обновления' }); return;
        }

        try {
             // Проверка на занятость email/phone другими
             if (updatedData.email || updatedData.phone) {
                 const conflict = await Tenant.findOne({ _id: { $ne: tenantId }, $or: [/* ... */] }).lean();
                 if (conflict) { /* ... обработка конфликта ... */ return; }
             }

            const updatedUser = await Tenant.findByIdAndUpdate(tenantId, { $set: updatedData }, { new: true, runValidators: true }).lean();
            if (!updatedUser) { res.status(404).json({ message: 'Арендатор не найден' }); return; }

            const responseUser = { /* ... данные без пароля ... */ };
            res.json({ message: 'Профиль обновлен', tenant: responseUser });

        } catch (error) {
            console.error("Update Tenant Error:", error);
            let message = 'Ошибка сервера'; let statusCode = 500;
             if (typeof error === 'object' && error !== null && (error as any).code === 11000) {
                 message = 'Email или Телефон уже занят.'; statusCode = 400;
             } else if (error instanceof Error) { message = error.message; }
            res.status(statusCode).json({ message });
        }
    }

    // --- Получение аватара (любого по ID) ---
    public async getAvatar(req: Request, res: Response): Promise<void> {
        const { tenantId } = req.params; // Используем tenantId для ясности
        if (!mongoose.Types.ObjectId.isValid(tenantId)) { res.status(400).json({ message: 'Неверный ID' }); return; }
        try {
            const tenant = await Tenant.findById(tenantId).select('ava');
            if (!tenant || !tenant.ava) { res.status(404).json({ message: 'Аватар не найден' }); return; }
            res.set('Content-Type', 'image/png');
            res.send(tenant.ava);
        } catch (error) {
            console.error("Get Tenant Avatar Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера';
             res.status(500).json({ message });
        }
    }

     /*
     public async getUser(req: Request, res: Response): Promise<void> {
         try {
            // ... найти арендатора по ID ...
            // ... получить отзывы о нем от АРЕНДОДАТЕЛЕЙ (ReviewLandlord) ...
            // ... посчитать средний рейтинг ...
            // ... вернуть только НЕ приватную информацию ...
         } catch (error) { ... }
     }
     */

}

// Экспортируем экземпляр
const tenantControllerInstance = new TenantsController();
export default tenantControllerInstance;