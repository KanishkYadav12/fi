import { Router } from 'express';
import { MonitorController } from '../controllers/MonitorController';
import { validate } from '../middleware/validate';
import { createMonitorSchema } from '../middleware/monitorValidator';

const router = Router();

router.get('/', MonitorController.getAll);
router.post('/', validate(createMonitorSchema), MonitorController.create);
router.delete('/:id', MonitorController.delete);

export default router;
