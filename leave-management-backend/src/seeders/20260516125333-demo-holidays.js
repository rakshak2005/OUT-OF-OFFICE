'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clear existing holidays first to avoid duplicates
    await queryInterface.bulkDelete('Holidays', null, {});

    const holidays = [
      { id: uuidv4(), date: new Date('2026-01-01'), name: "New Year's Day", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-01-14'), name: "Makar Sankranti / Pongal", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-01-26'), name: "Republic Day", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-02-15'), name: "Maha Shivaratri", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-03-04'), name: "Holi", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-03-19'), name: "Ugadi / Gudi Padwa", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-03-21'), name: "Eid-ul-Fitr (Ramzan Eid)", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-03-31'), name: "Mahavir Jayanti", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-04-03'), name: "Good Friday", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-04-14'), name: "Ambedkar Jayanti / Vaisakhi", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-05-01'), name: "May Day / Labour Day", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-05-27'), name: "Bakrid (Eid-ul-Zuha)", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-06-26'), name: "Muharram", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-08-15'), name: "Independence Day", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-08-26'), name: "Id-e-Milad", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-08-28'), name: "Raksha Bandhan", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-09-04'), name: "Janmashtami", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-09-14'), name: "Ganesh Chaturthi", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-10-02'), name: "Gandhi Jayanti", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-10-20'), name: "Dussehra (Vijayadashami)", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-11-08'), name: "Diwali (Deepavali)", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-11-09'), name: "Govardhan Puja", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-11-24'), name: "Guru Nanak Jayanti", isOptional: true, createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), date: new Date('2026-12-25'), name: "Christmas Day", isOptional: false, createdAt: new Date(), updatedAt: new Date() },
    ];

    return await queryInterface.bulkInsert('Holidays', holidays);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('Holidays', null, {});
  },
};