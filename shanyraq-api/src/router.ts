import { Router } from "express";
import Landlords from './enpoints/Landlords/router'
import Tenants from './enpoints/Tenants/router'
import Admin from './enpoints/Admin/router'
import House from './enpoints/House/router'
import Review from './enpoints/reviews'
import Complaint from './enpoints/Complaint'

const router = Router()

router.use('/Landlord',Landlords)
router.use('/Tenant',Tenants)
router.use('/Admin',Admin)
router.use('/House',House)
router.use('/review', Review)
router.use('/Complaint', Complaint)







export default router