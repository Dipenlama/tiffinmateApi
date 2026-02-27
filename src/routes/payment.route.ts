import { Router, raw } from 'express';
import paymentController from '../controllers/payment.controller';
import { authorizedMiddelWare } from '../middlewares/authorized.middleware';

const router = Router();

// create checkout session (authenticated)
router.post('/', authorizedMiddelWare, (req, res) => paymentController.createCheckoutSession(req, res));

// stripe webhook - needs raw body
router.post('/webhook', raw({ type: 'application/json' }), (req, res) => paymentController.webhook(req, res));

export default router;
