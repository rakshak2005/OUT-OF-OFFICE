import express from 'express';
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from '../controllers/holidayController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getHolidays);
router.post('/', protect, authorize('admin', 'manager'), addHoliday);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteHoliday);

export default router;