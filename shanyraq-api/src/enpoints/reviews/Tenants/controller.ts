// src/enpoints/reviews/Tenants/controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ReviewTenant, ReviewType } from "../../../DB/Schems/Tenants/reviewsTenant";
import { tenantRequest } from "../../Tenants/jwt";
// Импортируем ИНТЕРФЕЙС ITenant, а не модель Tenant для типизации populate
import { ITenant, Tenant } from "../../../DB/Schems/Tenants/tenant";
import { bindMethods } from "../../../BindMethonds";

class TReviewController {

    constructor() {
        bindMethods(this);
    }

    // --- Создание отзывов ---
    public async createForHouse(req: tenantRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.tenantId;
            if (!tenantId) { res.status(401).json({ message: 'Аутентификация не пройдена' }); return; }
            const { houseId } = req.params; const { rating, comment } = req.body;
            if (!mongoose.Types.ObjectId.isValid(houseId)) { res.status(400).json({ message: 'Неверный ID дома' }); return; }
            if (rating == null || typeof rating !== 'number' || rating < 1 || rating > 5) { res.status(400).json({ message: 'Рейтинг 1-5' }); return; }
            if (!comment?.trim()) { res.status(400).json({ message: 'Комментарий пуст' }); return; }
            const existingReview = await ReviewTenant.findOne({ objectId: houseId, TenantsId: tenantId, reviewType: ReviewType.HOUSE });
            if (existingReview) { res.status(400).json({ message: 'Отзыв уже есть' }); return; }
            const newReview = await ReviewTenant.create({ reviewType: ReviewType.HOUSE, objectId: houseId, TenantsId: tenantId, rating, comment: comment.trim() });
            res.status(201).json({ message: 'Отзыв о доме добавлен', review: newReview });
        } catch (error) { console.error("Create House Review Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }
    public async createForLandlord(req: tenantRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.tenantId; if (!tenantId) { res.status(401).json({ message: 'Аутентификация не пройдена' }); return; }
            const { landlordId } = req.params; const { rating, comment } = req.body;
            if (!mongoose.Types.ObjectId.isValid(landlordId)) { res.status(400).json({ message: 'Неверный ID арендодателя' }); return; }
            if (rating == null || typeof rating !== 'number' || rating < 1 || rating > 5) { res.status(400).json({ message: 'Рейтинг 1-5' }); return; }
            if (!comment?.trim()) { res.status(400).json({ message: 'Комментарий пуст' }); return; }
            const existingReview = await ReviewTenant.findOne({ objectId: landlordId, TenantsId: tenantId, reviewType: ReviewType.LANDLOAD });
            if (existingReview) { res.status(400).json({ message: 'Отзыв уже есть' }); return; }
            const newReview = await ReviewTenant.create({ reviewType: ReviewType.LANDLOAD, objectId: landlordId, TenantsId: tenantId, rating, comment: comment.trim() });
            res.status(201).json({ message: 'Отзыв об арендодателе добавлен', review: newReview });
        } catch (error) { console.error("Create Landlord Review Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }

    // --- Получение отзывов ---
    public async getHouseReviews(req: Request, res: Response): Promise<void> {
        try {
            const { houseId } = req.params; const { page = '1', limit = '10', rating = '0', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const pageNum = parseInt(page as string); const limitNum = parseInt(limit as string); const ratingNum = parseInt(rating as string);
            if (!mongoose.Types.ObjectId.isValid(houseId) || isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100 || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
                res.status(400).json({ message: 'Неверные параметры запроса' }); return;
            }
            const skip = (pageNum - 1) * limitNum;
            const filter: mongoose.FilterQuery<typeof ReviewTenant> = { objectId: houseId, reviewType: ReviewType.HOUSE, rating: { $gte: ratingNum } };
            const sort: { [key: string]: mongoose.SortOrder } = {};
            if (typeof sortBy === 'string' && ['createdAt', 'rating'].includes(sortBy)) sort[sortBy] = sortOrder === 'asc' ? 1 : -1; else sort['createdAt'] = -1;
            const totalReviews = await ReviewTenant.countDocuments(filter);
            // --- ИСПРАВЛЕНО: Используем ИНТЕРФЕЙС ITenant в Pick ---
            const reviews = await ReviewTenant.find(filter).sort(sort).skip(skip).limit(limitNum)
                .populate<{ TenantsId: Pick<ITenant, '_id' | 'firstName' | 'lastName'> }>('TenantsId', 'firstName lastName') // Используем ITenant
                .lean();
            // --- Конец исправления ---
            res.json({ reviews: reviews.map(r => ({ _id: r._id, author: r.TenantsId ? `${r.TenantsId.firstName || ''} ${r.TenantsId.lastName || ''}`.trim() : 'Аноним', rating: r.rating, comment: r.comment, createdAt: r.createdAt })), currentPage: pageNum, totalPages: Math.ceil(totalReviews / limitNum), totalReviews });
        } catch (error) { console.error("Get House Reviews Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }
    public async getLandlordReviews(req: Request, res: Response): Promise<void> {
         try {
            const { landlordId } = req.params; const { page = '1', limit = '10', rating = '0', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const pageNum = parseInt(page as string); const limitNum = parseInt(limit as string); const ratingNum = parseInt(rating as string);
             if (!mongoose.Types.ObjectId.isValid(landlordId) || isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100 || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
                res.status(400).json({ message: 'Неверные параметры запроса' }); return;
            }
            const skip = (pageNum - 1) * limitNum;
            const filter: mongoose.FilterQuery<typeof ReviewTenant> = { objectId: landlordId, reviewType: ReviewType.LANDLOAD, rating: { $gte: ratingNum } };
            const sort: { [key: string]: mongoose.SortOrder } = {};
            if (typeof sortBy === 'string' && ['createdAt', 'rating'].includes(sortBy)) sort[sortBy] = sortOrder === 'asc' ? 1 : -1; else sort['createdAt'] = -1;
            const totalReviews = await ReviewTenant.countDocuments(filter);
             // --- ИСПРАВЛЕНО: Используем ИНТЕРФЕЙС ITenant в Pick ---
             const reviews = await ReviewTenant.find(filter).sort(sort).skip(skip).limit(limitNum)
                 .populate<{ TenantsId: Pick<ITenant, '_id' | 'firstName' | 'lastName'> }>('TenantsId', 'firstName lastName') // Используем ITenant
                 .lean();
             // --- Конец исправления ---
             res.json({ reviews: reviews.map(r => ({ _id: r._id, author: r.TenantsId ? `${r.TenantsId.firstName || ''} ${r.TenantsId.lastName || ''}`.trim() : 'Аноним', rating: r.rating, comment: r.comment, createdAt: r.createdAt })), currentPage: pageNum, totalPages: Math.ceil(totalReviews / limitNum), totalReviews });
        } catch (error) { console.error("Get Landlord Reviews Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }

    // --- Удаление/Обновление отзывов ---
    public async deleteReview(req: tenantRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.tenantId; if (!tenantId) { res.status(401).json({ message: 'Аутентификация не пройдена' }); return; }
            const { reviewId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(reviewId)) { res.status(400).json({ message: 'Неверный ID отзыва' }); return; }
            const review = await ReviewTenant.findById(reviewId);
            if (!review) { res.status(404).json({ message: 'Отзыв не найден' }); return; }
            if (review.TenantsId.toString() !== tenantId) { res.status(403).json({ message: 'Нет прав на удаление' }); return; }
            await ReviewTenant.findByIdAndDelete(reviewId);
            res.status(200).json({ message: 'Отзыв удален' });
        } catch (error) { console.error("Delete Review Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }
    public async updateReview(req: tenantRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.tenantId; if (!tenantId) { res.status(401).json({ message: 'Аутентификация не пройдена' }); return; }
            const { reviewId } = req.params; const { rating, comment } = req.body;
            if (!mongoose.Types.ObjectId.isValid(reviewId)) { res.status(400).json({ message: 'Неверный ID отзыва' }); return; }
            if (rating != null && (typeof rating !== 'number' || rating < 1 || rating > 5)) { res.status(400).json({ message: 'Рейтинг 1-5' }); return; }
            if (comment != null && typeof comment !== 'string') { res.status(400).json({ message: 'Комментарий - строка' }); return; } // Пустую строку разрешаем
            const review = await ReviewTenant.findById(reviewId);
            if (!review) { res.status(404).json({ message: 'Отзыв не найден' }); return; }
            if (review.TenantsId.toString() !== tenantId) { res.status(403).json({ message: 'Нет прав на обновление' }); return; }
            let updated = false;
            if (rating != null && review.rating !== rating) { review.rating = rating; updated = true; }
            if (comment != null && review.comment !== comment.trim()) { review.comment = comment.trim(); updated = true; }
            if (updated) { await review.save(); res.status(200).json({ message: 'Отзыв обновлен', review }); }
            else { res.status(200).json({ message: 'Данные не изменились', review }); }
        } catch (error) { console.error("Update Review Error:", error); const message = error instanceof Error ? error.message : 'Ошибка'; res.status(500).json({ message }); }
    }
}

const tReviewControllerInstance = new TReviewController();
export default tReviewControllerInstance;