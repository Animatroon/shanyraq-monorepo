// src/DB/Schems/Tenants/tenant.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITenant extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    fatherName?: string; // Сделаем необязательным, если не всегда есть
    email: string;
    password?: string; // Пароль не всегда нужен в интерфейсе для возврата
    phone: string;
    iin: string; // Используем нижний регистр
    isBlacklisted: boolean; // Добавляем поле для бана
    blacklistReason?: string; // Причина бана (опционально)
    ava?: Buffer; // Делаем опциональным в интерфейсе
    createdAt: Date;
    updatedAt: Date;
}

const TenantsSchema = new Schema<ITenant>(
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
            lowercase: true, // Храним email в нижнем регистре
        },
        password: {
            type: String,
            required: true,
            select: false, // Не возвращать пароль по умолчанию при find()
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            // Убрал max/min, т.к. они для чисел. Валидацию длины лучше делать отдельно.
        },
        iin: { // Используем нижний регистр
            type: String,
            required: true, // ИИН должен быть обязателен
            unique: true,
            trim: true,
            // Убрал max/min. Валидация 12 символов.
        },
        ava: {
            type: Buffer,
            required: false, // Аватар не обязателен
        },
        isBlacklisted: { // Поле для бана
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

// Индекс для часто используемых полей поиска
TenantsSchema.index({ email: 1 });
TenantsSchema.index({ phone: 1 });
TenantsSchema.index({ iin: 1 });

export const Tenant = mongoose.model<ITenant>("Tenant", TenantsSchema);