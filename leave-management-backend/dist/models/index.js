"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Holiday = exports.Leave = exports.LeaveBalance = exports.LeaveType = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const LeaveType_1 = __importDefault(require("./LeaveType"));
exports.LeaveType = LeaveType_1.default;
const LeaveBalance_1 = __importDefault(require("./LeaveBalance"));
exports.LeaveBalance = LeaveBalance_1.default;
const Leave_1 = __importDefault(require("./Leave"));
exports.Leave = Leave_1.default;
const Holiday_1 = __importDefault(require("./Holiday"));
exports.Holiday = Holiday_1.default;
// Define associations
User_1.default.hasMany(Leave_1.default, { foreignKey: 'userId', as: 'leaves' });
User_1.default.hasMany(LeaveBalance_1.default, { foreignKey: 'userId', as: 'leaveBalances' });
User_1.default.hasMany(User_1.default, { foreignKey: 'managerId', as: 'subordinates' });
User_1.default.belongsTo(User_1.default, { foreignKey: 'managerId', as: 'manager' });
LeaveType_1.default.hasMany(LeaveBalance_1.default, { foreignKey: 'leaveTypeId' });
LeaveType_1.default.hasMany(Leave_1.default, { foreignKey: 'leaveTypeId' });
