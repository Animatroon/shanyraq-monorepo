import { Router } from "express";
import { JWTAccessLandlords } from "../../Landlords/jwt";
import controller from "./controller";

const router = Router();


router.post('/:tenantsId', JWTAccessLandlords, controller.create)

router.get('/:tenantsId', controller.get) 

router.patch('/:reviewId', JWTAccessLandlords, controller.update)

router.delete('/:reviewId', JWTAccessLandlords, controller.delete)

export default router;