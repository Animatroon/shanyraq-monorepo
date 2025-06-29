// src/DB/Schems/Landlords/landlord.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ILandlord extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    fatherName?: string; // Сделаем необязательным
    email: string;
    password?: string; // Скрываем пароль
    phone: string;
    iin: string; // Используем нижний регистр
    isBlacklisted: boolean; // Правильное имя поля
    blacklistReason?: string; // Причина бана (опционально)
    ava?: Buffer; // Опционально
    createdAt: Date;
    updatedAt: Date;
}

const LandlordSchema = new Schema<ILandlord>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        fatherName: {
            type: String,
            required: false, // Или true, если обязательно
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Не возвращать пароль по умолчанию
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
             // Валидация длины
        },
        iin: { // Используем нижний регистр
            type: String,
            required: true, // ИИН должен быть обязателен
            unique: true,
            trim: true,
             // Валидация 12 символов
        },
        ava: {
            type: Buffer,
            required: false,
        },
        isBlacklisted: { // Правильное имя поля
            type: Boolean,
            default: false,
        },
        blacklistReason: { // Причина бана
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

// Индексы
LandlordSchema.index({ email: 1 });
LandlordSchema.index({ phone: 1 });
LandlordSchema.index({ iin: 1 });


export const Landlord = mongoose.model<ILandlord>("Landlord", LandlordSchema);