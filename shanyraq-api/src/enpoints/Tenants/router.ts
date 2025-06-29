import { Router } from "express";
import controller from "./controller";
import multer from "multer";
import { body } from "express-validator";
import { validate } from "../validate";
import { JWTAccessTenants } from "./jwt";

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
        validate,
    ],
    controller.register
);

router.post(
    "/login",
    [
        body("password").isLength({ min: 8 }).withMessage("Пароль должен быть минимум 8 символов"),
    ],
    validate,
    controller.login
);

router.post("/refresh", controller.refresh);


router.get('/info', JWTAccessTenants , controller.getInfoUser)

router.patch('/', JWTAccessTenants, upload.single("ava"), controller.updateUser)

router.get('/ava/:tenantId', controller.getAvatar)

router.get('/', controller.getUser)

router.get('/:tenantId', controller.getUser)




export default router;
