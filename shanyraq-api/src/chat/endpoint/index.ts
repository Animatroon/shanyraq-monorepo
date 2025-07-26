import { Router } from "express";
import { JWTAccessUser } from "../../userRequest";
import controller from '../controller';

const router = Router();

router.get('/messages', JWTAccessUser, controller.getMessages);

export default router;