import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getPendingLeaves,
  updateLeaveStatus,
  getLeaveStats,
  getAiAssist,
  getActiveTodayLeaves,
  getLeaveById,
  getTeamCalendarLeaves,
  cancelLeave,
  getAiChatResponse,
  deleteLeave,
  getMyBalances,
} from '../controllers/leaveController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/team', protect, authorize('manager', 'hr'), getAllLeaves);
router.patch('/:id/approve', protect, authorize('manager', 'hr'), (req, res, next) => { req.body.status = 'approved'; next(); }, updateLeaveStatus);
router.patch('/:id/reject', protect, authorize('manager', 'hr'), (req, res, next) => { req.body.status = 'rejected'; next(); }, updateLeaveStatus);
router.delete('/:id', protect, deleteLeave);
router.get('/balance', protect, getMyBalances);

router.post('/ai-assist', protect, getAiAssist);
router.post('/ai-chat', protect, getAiChatResponse);
router.get('/active-today', protect, getActiveTodayLeaves);
router.get('/team-calendar', protect, getTeamCalendarLeaves);
router.get('/detail/:id', protect, getLeaveById);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/stats', protect, getLeaveStats);
router.get('/all', protect, authorize('manager', 'hr'), getAllLeaves);
router.get('/pending', protect, authorize('manager', 'hr'), getPendingLeaves);
router.put('/:id/cancel', protect, cancelLeave);
router.put('/:id', protect, authorize('manager', 'hr'), updateLeaveStatus);

export default router;