'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const leaveTypes = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Casual',
        annualQuota: 12,
        carryForwardMax: 5,
        isPaid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        name: 'Sick',
        annualQuota: 10,
        carryForwardMax: 3,
        isPaid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        name: 'Annual',
        annualQuota: 20,
        carryForwardMax: 10,
        isPaid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'd4e5f6a7-b8c9-0123-def1-234567890123',
        name: 'Unpaid',
        annualQuota: 0,
        carryForwardMax: 0,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return await queryInterface.bulkInsert('LeaveTypes', leaveTypes);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('LeaveTypes', null, {});
  },
};