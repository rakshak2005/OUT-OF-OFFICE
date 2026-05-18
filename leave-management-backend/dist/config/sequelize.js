"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDB = exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'leave_management',
    username: process.env.DB_USER || 'leave_admin',
    password: process.env.DB_PASSWORD || 'leave_admin_password',
    logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
    timezone: '+05:30', // IST
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
    }
    catch (error) {
        console.error('❌ Unable to connect to PostgreSQL:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const syncDB = async () => {
    try {
        // Only use this in development. For production, use migrations.
        if (process.env.NODE_ENV === 'development') {
            await exports.sequelize.sync({ alter: false });
            console.log('✅ Database synced');
        }
    }
    catch (error) {
        console.error('Error syncing database:', error);
    }
};
exports.syncDB = syncDB;
