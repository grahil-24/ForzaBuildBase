import { Router } from "express";
import { rename, remove} from "../controllers/tunes.controller";
import { protect } from "../middlewares/protectRoutes";

const router = Router();

router.use(protect);
router.patch('/:tuneid/rename', rename);
router.delete('/:tuneid/remove', remove);

export default router;