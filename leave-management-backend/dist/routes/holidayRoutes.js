"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const holidayController_1 = require("../controllers/holidayController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', holidayController_1.getHolidays);
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), holidayController_1.addHoliday);
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), holidayController_1.deleteHoliday);
exports.default = router;
