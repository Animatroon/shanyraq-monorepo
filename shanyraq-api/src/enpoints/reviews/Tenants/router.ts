// src/enpoints/reviews/Tenants/router.ts
import { Router } from "express";
import controller from "./controller";
import { JWTAccessTenants } from "../../Tenants/jwt"; // Убедись что импорт правильный

const router = Router();

// --- Получение отзывов ---
// Используем правильные имена: getHouseReviews, getLandlordReviews
router.get('/house/:houseId', controller.getHouseReviews);
router.get('/landlord/:landlordId', controller.getLandlordReviews);

// --- Создание отзывов ---
// Используем правильное имя: createForLandlord
router.post('/house/:houseId', JWTAccessTenants, controller.createForHouse);
router.post('/landlord/:landlordId', JWTAccessTenants, controller.createForLandlord);

// --- Обновление и удаление ---
// Имена deleteReview и updateReview совпадают
router.patch('/:reviewId', JWTAccessTenants, controller.updateReview);
router.delete('/:reviewId', JWTAccessTenants, controller.deleteReview);

export default router;