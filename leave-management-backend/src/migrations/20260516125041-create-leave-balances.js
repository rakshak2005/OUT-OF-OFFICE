'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LeaveBalances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      leaveTypeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'LeaveTypes',
          key: 'id',
        },
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      allocated: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      used: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      remaining: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      carriedForward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Unique constraint
    await queryInterface.addConstraint('LeaveBalances', {
      fields: ['userId', 'leaveTypeId', 'year'],
      type: 'unique',
      name: 'unique_user_leavetype_year',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LeaveBalances');
  },
};