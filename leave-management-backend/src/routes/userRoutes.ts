import express from 'express';
import { 
  getAllUsers, 
  deleteUser, 
  getUserLeaves, 
  updateUserLeaveBalance,
  createUser,
  changeUserPassword
} from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'hr', 'manager'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id/leaves', getUserLeaves);
router.put('/:id/leave-balance', updateUserLeaveBalance);
router.put('/:id/password', changeUserPassword);
router.delete('/:id', deleteUser);

export default router;
