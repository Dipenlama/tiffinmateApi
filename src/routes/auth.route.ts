import { Router } from "express";
import { AuthController } from "../cotrollers/auth.controller";

const router: Router=Router();
const authController=new AuthController();

router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;