'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedManager = await bcrypt.hash('manager123', salt);
    const hashedHR = await bcrypt.hash('hr123456', salt);
    const hashedAdmin = await bcrypt.hash('admin123', salt);
    const hashedEmployee = await bcrypt.hash('employee123', salt);

    const users = [
      {
        id: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
        email: 'manager@company.com',
        password: hashedManager,
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager',
        department: 'IT',
        joiningDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'f6a7b8c9-d0e1-2345-f123-456789012345',
        email: 'hr@company.com',
        password: hashedHR,
        firstName: 'Sarah',
        lastName: 'HR',
        role: 'hr',
        department: 'HR',
        joiningDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
        email: 'admin@company.com',
        password: hashedAdmin,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: 'Administration',
        joiningDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b8c9d0e1-f2a3-4567-1234-678901234567',
        email: 'employee@company.com',
        password: hashedEmployee,
        firstName: 'Jane',
        lastName: 'Employee',
        role: 'employee',
        department: 'IT',
        managerId: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
        joiningDate: new Date('2023-06-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return await queryInterface.bulkInsert('Users', users);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('Users', null, {});
  },
};