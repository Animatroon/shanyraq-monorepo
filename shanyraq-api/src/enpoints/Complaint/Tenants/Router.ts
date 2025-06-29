import { Router } from "express";
import { JWTAccessTenants } from "../../Tenants/jwt";
import controller from "./controller";

const router = Router();


router.post('/house/:houseId', JWTAccessTenants, controller.createForHouse)
router.post('/landlord/:landlordId', JWTAccessTenants, controller.createForLandlords)

router.get('/house/:houseId', controller.getHouse)  

router.get('/landlord/:landlordId', controller.getLandlord) 

router.delete('/:complaintId', JWTAccessTenants, controller.deleteComplaint)

router.patch('/:complaintId', JWTAccessTenants, controller.updateReview)

export default router;