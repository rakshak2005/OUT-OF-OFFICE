import { connectDB, syncDB, sequelize } from './config/sequelize';
import User from './models/User';
import LeaveType from './models/LeaveType';
import LeaveBalance from './models/LeaveBalance';

const seed = async () => {
  await connectDB();
  await sequelize.sync({ force: true }); // Reset DB

  console.log('Seeding Leave Types...');
  const casual = await LeaveType.create({ name: 'Casual', annualQuota: 12, carryForwardMax: 0, isPaid: true });
  const sick = await LeaveType.create({ name: 'Sick', annualQuota: 10, carryForwardMax: 5, isPaid: true });
  const annual = await LeaveType.create({ name: 'Annual', annualQuota: 20, carryForwardMax: 10, isPaid: true });

  console.log('Seeding Users...');
  const admin = await User.create({
    email: 'admin@company.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    department: 'IT',
  });

  const hr = await User.create({
    email: 'hr@company.com',
    password: 'hr123456',
    firstName: 'Sarah',
    lastName: 'HR',
    role: 'hr',
    department: 'Human Resources',
  });

  const manager = await User.create({
    email: 'manager@company.com',
    password: 'manager123',
    firstName: 'John',
    lastName: 'Manager',
    role: 'manager',
    department: 'Engineering',
  });

  const employee = await User.create({
    email: 'employee@company.com',
    password: 'employee123',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'employee',
    department: 'Engineering',
    managerId: manager.id,
  });

  console.log('Seeding Leave Balances for Employee...');
  const currentYear = new Date().getFullYear();
  
  await LeaveBalance.create({
    userId: employee.id,
    leaveTypeId: casual.id,
    year: currentYear,
    allocated: casual.annualQuota,
    remaining: casual.annualQuota,
    used: 0,
    carriedForward: 0,
  });

  await LeaveBalance.create({
    userId: employee.id,
    leaveTypeId: sick.id,
    year: currentYear,
    allocated: sick.annualQuota,
    remaining: sick.annualQuota,
    used: 0,
    carriedForward: 0,
  });

  await LeaveBalance.create({
    userId: employee.id,
    leaveTypeId: annual.id,
    year: currentYear,
    allocated: annual.annualQuota,
    remaining: annual.annualQuota,
    used: 0,
    carriedForward: 0,
  });

  console.log('Database seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
