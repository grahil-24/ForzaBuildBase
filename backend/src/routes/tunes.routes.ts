import { Router } from "express";
import { renameTune, removeTune, getTune, createAndUpdateTune, saveTune, getPublicTune} from "../controllers/tunes.controller";
import { protect } from "../middlewares/protectRoutes";

const router = Router();
router.get('/public/:publicurl', getPublicTune);
router.use(protect);
router.patch('/:tuneid/rename', renameTune);
router.delete('/:tuneid/remove', removeTune);
router.post('/create', createAndUpdateTune);
router.get('/:tuneid', getTune);
router.post('/:tuneid/save', saveTune);


export default router;