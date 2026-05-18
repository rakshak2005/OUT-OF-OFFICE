"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User extends sequelize_1.Model {
    // Method to compare password
    async comparePassword(candidatePassword) {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('employee', 'manager', 'hr', 'admin'),
        defaultValue: 'employee',
    },
    department: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    managerId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    joiningDate: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.sequelize,
    tableName: 'Users',
    timestamps: true,
});
// Hash password before saving
User.beforeCreate(async (user) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    user.password = await bcryptjs_1.default.hash(user.password, salt);
});
User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(user.password, salt);
    }
});
exports.default = User;
