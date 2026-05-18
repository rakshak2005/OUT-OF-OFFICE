"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
class LeaveBalance extends sequelize_1.Model {
}
LeaveBalance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    leaveTypeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    year: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    allocated: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    used: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    remaining: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    carriedForward: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'LeaveBalances',
    timestamps: true,
});
exports.default = LeaveBalance;
