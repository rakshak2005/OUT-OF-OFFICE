"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
class LeaveType extends sequelize_1.Model {
}
LeaveType.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    annualQuota: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    carryForwardMax: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 5,
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'LeaveTypes',
    timestamps: true,
});
exports.default = LeaveType;
