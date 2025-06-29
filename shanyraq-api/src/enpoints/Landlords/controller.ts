// src/enpoints/Landlords/controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Нужен для createTokens/refresh
import { Landlord, ILandlord } from "../../DB/Schems/Landlords/landlord";
import { RefreshLandlord } from "../../DB/Schems/Landlords/refreshLandlord";
import { Blacklist, BlacklistType } from "../../DB/Schems/admin/blacklist";
import crypt from '../../crypt'; // Убедись, что путь правильный
import { bindMethods } from "../../BindMethonds";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from "../../config/env";
import { landlordRequest } from "./jwt"; // Нужен для refresh и др.
import { House } from "../../DB/Schems/Landlords/house"; // Проверь путь к схеме House
import { ReviewLandlord } from "../../DB/Schems/Landlords/reviewLandlord";
import { ReviewTenant, ReviewType } from "../../DB/Schems/Tenants/reviewsTenant"; // Нужен для getUser
import { ITenant } from "../../DB/Schems/Tenants/tenant";


export class LandlordsController {

    constructor() {
        bindMethods(this);
    }

     // --- Приватные методы для токенов ---
     private createAccsess(id: string): string {
        const access = jwt.sign(
        { landlordId: id, createdAt: Math.floor(Date.now() / 1000) }, // Используем landlordId
        JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES }
        );
        return access;
    }
    private createTokens(landlordId: string):{access: string, refresh: string} {
        const access = this.createAccsess(landlordId);
        const refresh = jwt.sign(
            { landlordId: landlordId }, // Используем landlordId
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
             // TODO: Добавить валидацию формата email и phone

            // --- Декодируем ЭЦП ---
            const decodedData = crypt.decodeBuffer(buffer.buffer, passwordForbuffer);
            if (decodedData.error || !decodedData.iin || !decodedData.firstName || !decodedData.lastName) {
                res.status(400).json({ message: decodedData.message || 'Ошибка декодирования ЭЦП или неполные данные' }); return;
            }
            // --- IIN теперь доступен ---
            const { firstName, lastName, fatherName, iin } = decodedData;

            // --- Проверка на черный список ---
            const blacklistedEntry = await Blacklist.findOne({ value: { $in: [email, iin] } }).lean();
            if (blacklistedEntry) {
                const type = blacklistedEntry.type === BlacklistType.EMAIL ? 'Email' : 'ИИН';
                // --- ИСПРАВЛЕНО: Убираем return перед res.json() ---
                res.status(403).json({ message: `${type} в черном списке. Причина: ${blacklistedEntry.reason || 'Не указана'}` });
                return; // Просто выходим
            }
            // --- Конец проверки ---

            // --- Проверка на существующего пользователя ---
            // Используем iin (нижний регистр) как в схеме
            const existingLandlord = await Landlord.findOne({
                $or: [ { email: email }, { phone: phone }, { iin: iin } ]
            }).lean();

            if (existingLandlord) {
                let text = 'Пользователь с такими данными уже существует'; // Общее сообщение
                if (existingLandlord.email === email) text = 'Почта уже занята';
                else if (existingLandlord.phone === phone) text = 'Телефон уже занят';
                else if (existingLandlord.iin === iin) text = 'ИИН уже занят';

                res.status(400).json({ message: text });
                return;
            }
            // --- Конец проверки ---

            // Хешируем пароль
            const salt = await bcrypt.genSalt(10);
            const hashPass = await bcrypt.hash(password, salt);

            // Создаем пользователя (используем iin)
            await Landlord.create({
                firstName, lastName, fatherName, iin, phone, email, password: hashPass
                // isBlacklisted по умолчанию false
            });

            res.status(201).json({ message: 'Регистрация прошла успешно' });

        } catch (error) { // Обработка ошибок
            console.error("Landlord Registration Error:", error);
            let message = 'Ошибка сервера при регистрации'; let statusCode = 500;
            if (typeof error === 'object' && error !== null && (error as any).code === 11000) {
                message = 'Пользователь с таким Email, телефоном или ИИН уже существует.'; statusCode = 400;
            } else if (error instanceof Error) { message = error.message; }
            res.status(statusCode).json({ message });
        }
    }

    // --- Логин ---
    public async login(req: Request,res: Response): Promise<void> {
        try {
            const { login, password } = req.body;

            // Ищем по email или phone и ЗАПРАШИВАЕМ пароль
            const user = await Landlord.findOne({ $or: [ { email: login }, { phone: login } ] }).select('+password');

            if (!user) { res.status(400).json({message: 'Неверный логин или пароль'}); return; }

            // --- Проверка на черный список ПРИ ЛОГИНЕ ---
            if (user.isBlacklisted) {
                res.status(403).json({ message: `Ваш аккаунт заблокирован. Причина: ${user.blacklistReason || 'Не указана'}` });
                return;
            }
            // --- Конец проверки ---

            if (!user.password) { // Пароль должен быть после select('+password')
                 console.error(`Landlord ${user._id} has no password in DB.`);
                 res.status(500).json({ message: 'Ошибка конфигурации аккаунта' }); return;
            }

            const isHash = await bcrypt.compare(password, user.password);
            if (!isHash) { res.status(400).json({message: 'Неверный логин или пароль'}); return; }

            const { access, refresh } = this.createTokens(user._id.toString());
            res.cookie("refresh", refresh, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none', maxAge: JWT_REFRESH_EXPIRES * 1000
             });

            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const userAgent = req.headers["user-agent"] || 'unknown';
            await RefreshLandlord.create({
                landlordId: user._id, token: refresh, ipAdress: Array.isArray(ip) ? ip[0] : ip, device: userAgent
            });

            // Возвращаем данные без пароля (он и так исключен схемой по умолчанию)
            res.json({
                access: access,
                landlord: {
                    id: user._id, firstName: user.firstName, lastName: user.lastName, fatherName: user.fatherName,
                    iin: user.iin, // Используем iin
                    email: user.email, phone: user.phone,
                    // Добавить ava URL если нужно
                    // ava: `/api/Landlord/avatar/${user._id}` // Пример URL
                }
            });
        }
        catch (error) {
            console.error("Landlord Login Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при входе';
            res.status(500).json({message});
        }
    }

    // --- Обновление токена ---
    public async refresh(req: landlordRequest, res: Response): Promise<void>{ // landlordRequest из твоего jwt
        try {
            const refreshToken = req.cookies.refresh;
            if (!refreshToken) { res.status(401).json({ message: 'Отсутствует refresh токен' }); return; }

            let decoded: any;
            try {
                decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            } catch (err) { res.status(401).json({ message: 'Невалидный или истекший refresh токен' }); return; }

            const landlordId = decoded.landlordId; // Проверяем landlordId
            if (!landlordId || !mongoose.Types.ObjectId.isValid(landlordId)) {
                 res.status(401).json({ message: 'Невалидный токен: неверный ID арендодателя' }); return;
            }

            // Проверяем токен в базе RefreshLandlord
            const tokenExists = await RefreshLandlord.findOne({ landlordId: landlordId, token: refreshToken, isActive: true });
            if (!tokenExists) { res.status(401).json({ message: 'Токен не найден или неактивен' }); return; }

            const accessToken = this.createAccsess(landlordId);
            res.status(200).json({ access: accessToken }); // Отправляем access, а не accessToken

        } catch (error) {
            console.error("Landlord Refresh Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при обновлении токена';
            res.status(500).json({ message });
        }
    }

    // --- Получение информации о себе ---
    public async getInfoUser(req: landlordRequest, res: Response): Promise<void> { // landlordRequest из jwt
        try {
            const landlordId = req.landlordId; // Получаем ID из middleware
            if (!landlordId) { res.status(401).json({message: 'Не удалось определить пользователя (токен)' }); return; }

            const landlord = await Landlord.findById(landlordId).lean(); // Используем lean
            if (!landlord) { res.status(404).json({message: 'Арендодатель не найден'}); return; }

            res.json({
                landlord: {
                    id: landlord._id, firstName: landlord.firstName, lastName: landlord.lastName,
                    fatherName: landlord.fatherName, iin: landlord.iin, // Используем iin
                    email: landlord.email, phone: landlord.phone,
                    // Динамический URL для аватара
                    ava: landlord.ava ? `/api/Landlord/avatar/${landlord._id}` : null // Отдаем URL или null
                }
            });

        } catch (error) {
            console.error("Get Landlord Info Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении информации';
            res.status(500).json({ message });
        }
    }

    // --- Получение своих домов ---
    public async getMyHouse(req: landlordRequest, res: Response): Promise<void> { // landlordRequest из jwt
        try {
            const landlordId = req.landlordId;
            if (!landlordId) { res.status(401).json({message: 'Не удалось определить пользователя (токен)'}); return; }

            const houses = await House.find({ landlordId }).lean(); // Используем lean
            res.json(houses); // Возвращаем массив домов

        } catch (error) {
            console.error("Get My Houses Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении домов';
            res.status(500).json({ message });
        }
    }

    // --- Получение списка других арендодателей (для тенантов?) ---
    // Если этот метод нужен, переименовать или уточнить его назначение
    public async getLandlordListForPublic(req: Request, res: Response): Promise<void> { // Обычный Request, т.к. может быть публичным
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20; // Используем limit
            const skip = (page - 1) * limit;

            const totalLandlords = await Landlord.countDocuments(); // Считаем общее количество
            const landlords = await Landlord.find() // Ищем всех
                .select('firstName lastName fatherName email phone iin ava') // Выбираем нужные поля
                .skip(skip)
                .limit(limit)
                .lean();

            // Параллельно получаем средний рейтинг для каждого
            const finalLandlords = await Promise.all(landlords.map(async (landlord) => {
                // Считаем средний рейтинг из отзывов АРЕНДАТОРОВ (ReviewTenant)
                const reviews = await ReviewTenant.aggregate([
                    { $match: { objectId: landlord._id, reviewType: ReviewType.LANDLOAD } }, // Фильтр по ID и типу
                    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } } // Группировка и подсчет среднего
                ]);
                const avgResult = reviews[0]; // Результат агрегации (или undefined)

                return {
                    id: landlord._id,
                    firstName: landlord.firstName, lastName: landlord.lastName, fatherName: landlord.fatherName,
                    email: landlord.email, phone: landlord.phone, iin: landlord.iin, // Используем iin
                    ava: landlord.ava ? `/api/Landlord/avatar/${landlord._id}` : null,
                    averageRating: avgResult ? parseFloat(avgResult.avgRating.toFixed(1)) : null, // Средний рейтинг или null
                    reviewCount: avgResult ? avgResult.count : 0 // Количество отзывов
                };
            }));

            res.json({
                landlords: finalLandlords, // Используем landlords вместо tenants
                currentPage: page,
                totalPages: Math.ceil(totalLandlords / limit),
                totalLandlords
             });

        } catch (error) {
            console.error("Get Landlord List Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении списка арендодателей';
            res.status(500).json({ message });
        }
    }

    // --- Обновление своего профиля ---
    public async updateUser(req: landlordRequest, res: Response): Promise<void> { // landlordRequest из jwt
        const landlordId = req.landlordId;
         if (!landlordId) { res.status(401).json({message: 'Не удалось определить пользователя (токен)'}); return; }

        const { phone, email } = req.body;
        const avaFile = req.file; // Аватар

        // Создаем объект с полями для обновления
        const updatedData: Partial<ILandlord> = {}; // Используем Partial<Interface>
        if (phone && typeof phone === 'string') updatedData.phone = phone.trim();
        if (email && typeof email === 'string') updatedData.email = email.trim().toLowerCase();
        if (avaFile) updatedData.ava = avaFile.buffer;

        // Проверяем, есть ли что обновлять
        if (Object.keys(updatedData).length === 0) {
            res.status(400).json({ message: 'Нет данных для обновления' }); return;
        }

        try {
            // TODO: Добавить валидацию email и phone перед обновлением
            // Проверка на занятость email/phone другими пользователями, если они меняются
            if (updatedData.email || updatedData.phone) {
                const conflictingUser = await Landlord.findOne({
                     _id: { $ne: landlordId }, // Исключаем себя
                     $or: [
                         ...(updatedData.email ? [{ email: updatedData.email }] : []),
                         ...(updatedData.phone ? [{ phone: updatedData.phone }] : [])
                     ]
                 }).lean();
                 if (conflictingUser) {
                      let conflictField = conflictingUser.email === updatedData.email ? 'Email' : 'Телефон';
                      res.status(400).json({ message: `${conflictField} уже занят другим пользователем` }); return;
                 }
            }


            const updatedUser = await Landlord.findByIdAndUpdate(
                landlordId,
                { $set: updatedData }, // Используем $set для обновления только переданных полей
                { new: true, runValidators: true } // Возвращаем новый документ, применяем валидаторы схемы
                ).lean(); // Используем lean

            if (!updatedUser) {
                 res.status(404).json({ message: 'Арендодатель не найден для обновления' }); return;
            }

            // Формируем ответ без пароля и буфера аватара
             const responseUser = {
                 id: updatedUser._id, firstName: updatedUser.firstName, lastName: updatedUser.lastName,
                 fatherName: updatedUser.fatherName, iin: updatedUser.iin,
                 email: updatedUser.email, phone: updatedUser.phone,
                 ava: updatedUser.ava ? `/api/Landlord/avatar/${updatedUser._id}` : null
             };

            res.json({ message: 'Профиль обновлен', landlord: responseUser });

        } catch (error) {
            console.error("Update Landlord Error:", error);
            let message = 'Ошибка сервера при обновлении профиля'; let statusCode = 500;
             if (typeof error === 'object' && error !== null && (error as any).code === 11000) {
                 message = 'Email или Телефон уже занят.'; statusCode = 400;
             } else if (error instanceof Error) { message = error.message; }
            res.status(statusCode).json({ message });
        }
    }

    // --- Получение аватара (любого пользователя по ID) ---
    public async getAvatar(req: Request, res: Response): Promise<void> {
        const { landlordId } = req.params; // ID из URL

        if (!mongoose.Types.ObjectId.isValid(landlordId)) {
            res.status(400).json({ message: 'Неверный формат ID' }); return;
        }

        try {
            // Ищем пользователя и выбираем только поле ava
            const landlord = await Landlord.findById(landlordId).select('ava');

            if (!landlord || !landlord.ava) {
                res.status(404).json({ message: 'Аватар не найден' }); return;
            }

            // Устанавливаем тип контента (предполагаем png, лучше хранить mime type)
            res.set('Content-Type', 'image/png'); // TODO: Сделать Content-Type динамическим
            res.send(landlord.ava); // Отправляем буфер

        } catch (error) {
            console.error("Get Avatar Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при получении аватара';
             res.status(500).json({ message });
        }
    }

    // --- Получение публичной информации о конкретном арендодателе ---
    public async getUser(req: Request, res: Response): Promise<void> { // Обычный Request
        try {
            const { landlordId } = req.params;
             if (!mongoose.Types.ObjectId.isValid(landlordId)) {
                res.status(400).json({ message: 'Неверный формат ID' }); return;
            }

            // Ищем арендодателя
            const landlord = await Landlord.findById(landlordId).lean();
            if (!landlord) { res.status(404).json({message: 'Арендодатель не найден'}); return; }

            // Ищем последние 10 отзывов от АРЕНДАТОРОВ
            const recentReviews = await ReviewTenant.find({ objectId: landlordId, reviewType: ReviewType.LANDLOAD })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate<{ TenantsId: Pick<ITenant, '_id' | 'firstName' | 'lastName'> }>('TenantsId', 'firstName lastName') // Получаем имя автора
                .lean();

            // Считаем средний рейтинг по ВСЕМ отзывам от АРЕНДАТОРОВ
            const ratingAggregation = await ReviewTenant.aggregate([
                { $match: { objectId: new mongoose.Types.ObjectId(landlordId), reviewType: ReviewType.LANDLOAD } },
                { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
            ]);
            const avgResult = ratingAggregation[0];

            res.json({
                landlord: {
                    id: landlord._id, // Добавляем ID
                    firstName: landlord.firstName, lastName: landlord.lastName, fatherName: landlord.fatherName,
                    // Не возвращаем email, phone, iin в публичном методе
                    // iin: landlord.iin, email: landlord.email, phone: landlord.phone,
                    ava: landlord.ava ? `/api/Landlord/avatar/${landlord._id}` : null,
                    createdAt: landlord.createdAt, // Можно вернуть дату как есть (ISO строка)
                    // Отзывы
                    reviews: recentReviews.map(r => ({ // Форматируем отзывы
                        _id: r._id,
                        author: r.TenantsId ? `${r.TenantsId.firstName || ''} ${r.TenantsId.lastName || ''}`.trim() : 'Аноним',
                        rating: r.rating,
                        comment: r.comment,
                        createdAt: r.createdAt
                    })),
                    averageRating: avgResult ? parseFloat(avgResult.avgRating.toFixed(1)) : null,
                    reviewCount: avgResult ? avgResult.count : 0
                }
            });
        }
        catch (error) {
            console.error("Get Landlord Public Info Error:", error);
             const message = error instanceof Error ? error.message : 'Ошибка сервера при получении информации об арендодателе';
            res.status(500).json({ message });
        }
    }
}

const landlordControllerInstance = new LandlordsController();
export default landlordControllerInstance; // Экспортируем экземпляр