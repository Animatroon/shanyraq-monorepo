import { Router } from "express";
import controller from './controller';
import { JWTAccessAdmin } from "../jwt";

const router = Router();

router.use(JWTAccessAdmin);

console.log("Registering GET /Admin/landlords route..."); 
router.get('/landlords', controller.getLandlords);
router.get('/tenants', controller.getTenants);

router.patch('/tenants/:complaintId/status', controller.setStatusTenantComplaint);
router.patch('/landlords/:complaintId/status', controller.setStatusLandlordComplaint);

export default router;