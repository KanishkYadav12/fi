import { Router } from 'express';
import { MonitorController } from '../controllers/MonitorController';

const router = Router();

router.get('/', MonitorController.getAll);
router.post('/', MonitorController.create);
router.delete('/:id', MonitorController.delete);

export default router;
