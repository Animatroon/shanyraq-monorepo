import { Router } from "express";
import Tenants from './Tenants/Router'
import Landlords from './Landlords/Router'

const router = Router();


router.use('/Tenants',Tenants)
router.use('/Landlords',Landlords)


export default router;



