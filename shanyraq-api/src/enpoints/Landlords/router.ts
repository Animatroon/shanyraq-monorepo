import { Router } from "express";
import controller from "./controller";
import multer from "multer";
import { body } from "express-validator";
import { validate } from "../validate";
import { JWTAccessLandlords } from "./jwt";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const phoneRegex = /^\d{10}$/;


router.post(
    "/register",
    upload.single("file"),
    [
        body("password").isLength({ min: 8 }).withMessage("Пароль должен быть минимум 8 символов"),
        body("phone").matches(phoneRegex).withMessage("Неверный формат телефона").trim(),
        body("email").isEmail().withMessage("Некорректный email").trim(),
        validate
    ],
    validate,
    controller.register
);

router.post(
    "/login",
    [
        body("password").isLength({ min: 8 }).withMessage("Пароль должен быть минимум 8 символов"),
        validate
    ],
    validate,
    controller.login
);



router.post("/refresh", controller.refresh);

router.get('/info', JWTAccessLandlords , controller.getInfoUser)

router.get('/House',JWTAccessLandlords, controller.getMyHouse)

router.get('/', controller.getUser)

router.patch('/', JWTAccessLandlords, upload.single("ava"), controller.updateUser)

router.get('/ava/:tenantId', controller.getAvatar)

router.get('/:landlordId', controller.getUser)

export default router;
