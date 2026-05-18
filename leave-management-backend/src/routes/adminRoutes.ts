import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { addHoliday } from '../controllers/holidayController';
import { LeaveType } from '../models';

const router = express.Router();

router.post('/holidays', protect, authorize('admin'), addHoliday);

router.get('/leave-types', protect, async (req, res) => {
  try {
    const leaveTypes = await LeaveType.findAll();
    res.json(leaveTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave types' });
  }
});

export default router;
