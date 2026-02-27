import { Router } from 'express';
import adminItemController from '../../cotrollers/admin/item.controller';
import { authorizedMiddelWare, adminMiddleware } from '../../middlewares/authorized.middleware';

const router = Router();

router.use(authorizedMiddelWare, adminMiddleware);

router.get('/', adminItemController.list);
router.get('/:id', adminItemController.get);
router.post('/', adminItemController.create);
router.put('/:id', adminItemController.update);
router.delete('/:id', adminItemController.remove);

export default router;
