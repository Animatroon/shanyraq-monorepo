import { Router } from "express";
import multer from "multer";
import controller from './controller'
import { JWTAccessLandlords } from "../Landlords/jwt";
import { body } from "express-validator";
import { validate } from "../validate";
import { JWTAccessTenants, JWTAccessTenantsNotNecessary } from "../Tenants/jwt";
import { CityType, HouseType, RentalsType } from "../../DB/Schems/Landlords/house";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router()

router.post('/',JWTAccessLandlords,
[
    // body("roomCount").isInt({ min: 1 }).withMessage("roomCount должен быть числом >= 1"),
    // body("meterSquare").isFloat({ min: 1 }).withMessage("meterSquare должен быть числом > 1"),
    // body("floor").isInt({ min: 1 }).withMessage("floor должен быть числом >= 1"),
    // body("city").isIn(Object.values(CityType)).withMessage(`city должен быть одним из: ${Object.values(CityType).join(', ')}`),
    // body("address").isString().trim().notEmpty().withMessage("address обязателен"),
    // body("price").isFloat({ min: 0 }).withMessage("price должен быть положительным числом"),
    // body("description").optional().isString().withMessage("description должен быть строкой"),
    // body("type").isIn(Object.values(HouseType)).withMessage(`complaintType должен быть одним из: ${Object.values(HouseType).join(', ')}`),
    // body("rentals").isIn(Object.values(RentalsType)).withMessage(`complaintType должен быть одним из: ${Object.values(HouseType).join(', ')}`),
    validate
],upload.array("images"),controller.createHouse)

router.delete('/:houseId',JWTAccessLandlords,controller.deleteHouse)

router.get('/',JWTAccessTenantsNotNecessary,controller.getHouses)

router.get('/:houseId',controller.getOneHouse)

router.get('/image/:imageId',controller.getImage)

router.patch('/:houseId',JWTAccessLandlords,
    body("roomCount").optional().isInt({ min: 1 }).withMessage("roomCount должен быть числом >= 1"),
    body("meterSquare").optional().isFloat({ min: 1 }).withMessage("meterSquare должен быть числом > 1"),
    body("floor").optional().isInt({ min: 1 }).withMessage("floor должен быть числом >= 1"),
    body("city").optional().isIn(Object.values(CityType)).withMessage(`city должен быть одним из: ${Object.values(CityType).join(', ')}`),
    body("address").optional().isString().trim().withMessage("не верный address"),
    body("price").optional().isFloat({ min: 0 }).withMessage("price должен быть положительным числом"),
    body("description").optional().isString().withMessage("description должен быть строкой"),
    body("type").optional().isIn(Object.values(HouseType)).withMessage(`complaintType должен быть одним из: ${Object.values(HouseType).join(', ')}`),
    body("rentals").optional().isIn(Object.values(RentalsType)).withMessage(`complaintType должен быть одним из: ${Object.values(HouseType).join(', ')}`),
    validate
,controller.updateHouse)

router.post('/favorit/:houseId',JWTAccessTenants,controller.setFavorite)

router.get('/favorit',JWTAccessTenants,controller.getFavorite)

router.delete('/favorit/:houseId',JWTAccessTenants,controller.deleteFavorite)



export default router