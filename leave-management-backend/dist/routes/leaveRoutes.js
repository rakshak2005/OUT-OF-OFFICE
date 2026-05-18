"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaveController_1 = require("../controllers/leaveController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, leaveController_1.applyLeave);
router.get('/my-leaves', authMiddleware_1.protect, leaveController_1.getMyLeaves);
router.get('/stats', authMiddleware_1.protect, leaveController_1.getLeaveStats);
router.get('/all', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('manager', 'hr', 'admin'), leaveController_1.getAllLeaves);
router.get('/pending', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('manager', 'hr', 'admin'), leaveController_1.getPendingLeaves);
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('manager', 'hr', 'admin'), leaveController_1.updateLeaveStatus);
exports.default = router;
