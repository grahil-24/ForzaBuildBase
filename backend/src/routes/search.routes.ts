import { Router } from "express";
import { protect } from "../middlewares/protectRoutes";
import { searchTunes, searchUser } from "../controllers/search.controller";

const router = Router();
router.use(protect);

router.get('/users', searchUser);
router.get('/tunes', searchTunes);

export default router;