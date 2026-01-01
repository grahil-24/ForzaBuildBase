import { Router } from "express";
import { rename } from "../controllers/tunes.controller";
import { protect } from "../middlewares/protectRoutes";

const router = Router();

router.use(protect);
router.patch('/:tuneid/rename', rename);

export default router;