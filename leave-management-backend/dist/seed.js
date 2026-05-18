"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const seedManagers = async () => {
    try {
        await (0, database_1.connectDB)();
        // Optional: Clear existing manager/hr/admin accounts
        // await User.deleteMany({ role: { $in: ['manager', 'hr', 'admin'] } });
        const managers = [
            {
                email: 'manager@company.com',
                password: 'manager123',
                firstName: 'John',
                lastName: 'Manager',
                role: 'manager',
                department: 'IT',
                leaveBalance: {
                    casual: 12,
                    sick: 10,
                    annual: 20,
                    total: 42,
                },
            },
            {
                email: 'hr@company.com',
                password: 'hr123456',
                firstName: 'Sarah',
                lastName: 'HR',
                role: 'hr',
                department: 'HR',
                leaveBalance: {
                    casual: 12,
                    sick: 10,
                    annual: 20,
                    total: 42,
                },
            },
            {
                email: 'admin@company.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                department: 'Administration',
                leaveBalance: {
                    casual: 12,
                    sick: 10,
                    annual: 20,
                    total: 42,
                },
            },
        ];
        for (const managerData of managers) {
            const existingUser = await User_1.default.findOne({
                email: managerData.email,
            });
            if (!existingUser) {
                await User_1.default.create(managerData);
                console.log(`✅ Created: ${managerData.email} (${managerData.role})`);
            }
            else {
                console.log(`⚠️ Already exists: ${managerData.email}`);
            }
        }
        console.log('\n🎉 Manager accounts seeded successfully!');
        console.log('\nManager Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Manager: manager@company.com / manager123');
        console.log('HR:      hr@company.com / hr123456');
        console.log('Admin:   admin@company.com / admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding managers:', error);
        process.exit(1);
    }
};
seedManagers();
