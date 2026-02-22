import { Router } from "express";
import { protect } from "../middlewares/protectRoutes";
import { searchUser } from "../controllers/search.controller";

const router = Router();
router.use(protect);

router.get('/user', searchUser);

export default router;