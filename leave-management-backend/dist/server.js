"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const sequelize_1 = require("./config/sequelize");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
const holidayRoutes_1 = __importDefault(require("./routes/holidayRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect Database
(0, sequelize_1.connectDB)();
// Sync Database (for development only - use migrations in production)
(0, sequelize_1.syncDB)();
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/leaves', leaveRoutes_1.default);
app.use('/api/holidays', holidayRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Leave Management API is running');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Manager Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Manager: manager@company.com / manager123');
    console.log('HR:      hr@company.com / hr123456');
    console.log('Admin:   admin@company.com / admin123');
    console.log('Employee: employee@company.com / employee123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
