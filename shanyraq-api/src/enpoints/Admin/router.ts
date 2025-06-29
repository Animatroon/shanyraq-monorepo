import { Router } from "express";
import { JWTAccessAdmin } from "./jwt";
import controller from './constroller'
import Complaint from './Complaints/router'

const router = Router()

router.post('/create', JWTAccessAdmin, controller.create)
router.post('/login', controller.login)
router.post('/refresh', controller.refresh)

router.get('/tenants', JWTAccessAdmin, controller.getTenants)
router.get('/landlords', JWTAccessAdmin, controller.getLandlords)
router.post('/logout', controller.logout)
router.use('/complaints', Complaint)

router.get('/chats', JWTAccessAdmin, controller.getAdminChats);
router.get('/chats/:chatId/messages', JWTAccessAdmin, controller.getAdminChatMessages); 


export default router