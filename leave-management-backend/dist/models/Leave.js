"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const User_1 = __importDefault(require("./User"));
const LeaveType_1 = __importDefault(require("./LeaveType"));
class Leave extends sequelize_1.Model {
}
Leave.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    leaveTypeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'LeaveTypes',
            key: 'id',
        },
    },
    fromDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    toDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    totalDays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 1000],
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending',
    },
    appliedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    decidedBy: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    decidedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    decisionRemark: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'Leaves',
    timestamps: true,
});
Leave.belongsTo(User_1.default, { foreignKey: 'userId', as: 'applicant' });
Leave.belongsTo(User_1.default, { foreignKey: 'decidedBy', as: 'approver' });
Leave.belongsTo(LeaveType_1.default, { foreignKey: 'leaveTypeId', as: 'leaveType' });
exports.default = Leave;
