import { Router } from "express";
import Tenants from './Tenants/router'
import Landlords from './Landlords/router'

const router = Router();


router.use('/Tenant',Tenants)
router.use('/Landlord',Landlords)


export default router;