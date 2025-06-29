import { Router } from "express";
import { JWTAccessLandlords } from "../../Landlords/jwt";
import controller from "./controller";
import { body } from "express-validator";
import { validate } from "../../validate";
import { ComplaintType } from "../../../DB/Schems/Landlords/ComplaintLandlord";
const router = Router();


router.post('/:tenantsId', JWTAccessLandlords, 
    [
        body("complaintType")
        .isIn(Object.values(ComplaintType))
        .withMessage(`complaintType должен быть одним из: ${Object.values(ComplaintType).join(', ')}`),
        body("comment").isString().withMessage("Комментарий должен быть строкой").trim(),
        validate,
    ],    
controller.create)

router.get('/:tenantsId', controller.get) 

router.patch('/:complaintId', JWTAccessLandlords,
    [
        body("complaintType")
        .optional()
        .isIn(Object.values(ComplaintType))
        .withMessage(`complaintType должен быть одним из: ${Object.values(ComplaintType).join(', ')}`),
        
        body("comment").optional().isString().withMessage("Комментарий должен быть строкой").trim(),
        validate,
    ],
controller.update)

router.delete('/:complaintId', JWTAccessLandlords,controller.delete)

export default router;