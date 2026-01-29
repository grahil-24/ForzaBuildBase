import { Router } from "express";
import { rename, remove, create, getTune} from "../controllers/tunes.controller";
import { protect } from "../middlewares/protectRoutes";

const router = Router();

router.use(protect);
router.patch('/:tuneid/rename', rename);
router.delete('/:tuneid/remove', remove);
router.post('/create', create);
router.get('/:tuneid', getTune);

export default router;