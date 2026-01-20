import { Router } from "express";
import { AdminUserController } from "../../cotrollers/admin/user.controller";
import { Response, Request } from "express";
import { authorizedMiddelWare } from "../../middlewares/authorized.middleware";

const router:Router=Router();
const adminUserController= new AdminUserController();

router.post('/',authorizedMiddelWare, adminUserController.createUser);

router.get('/test',
    authorizedMiddelWare,
     (req: Request, res:Response)=>{
    res.send('TEst route works');
});

export default router;