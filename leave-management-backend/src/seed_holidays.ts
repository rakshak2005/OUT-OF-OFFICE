import { connectDB, sequelize } from './config/sequelize';
import Holiday from './models/Holiday';

const seedHolidays = async () => {
  await connectDB();
  
  console.log('Seeding Company Holidays...');

  const currentYear = new Date().getFullYear(); // 2026

  const holidays = [
    { date: new Date(`${currentYear}-01-01`), name: "New Year's Day", isOptional: false },
    { date: new Date(`${currentYear}-01-19`), name: "Martin Luther King Jr. Day", isOptional: true },
    { date: new Date(`${currentYear}-05-25`), name: "Memorial Day", isOptional: false },
    { date: new Date(`${currentYear}-06-19`), name: "Juneteenth National Independence Day", isOptional: true },
    { date: new Date(`${currentYear}-07-04`), name: "Independence Day", isOptional: false },
    { date: new Date(`${currentYear}-09-07`), name: "Labor Day", isOptional: false },
    { date: new Date(`${currentYear}-11-26`), name: "Thanksgiving Day", isOptional: false },
    { date: new Date(`${currentYear}-11-27`), name: "Day after Thanksgiving", isOptional: true },
    { date: new Date(`${currentYear}-12-25`), name: "Christmas Day", isOptional: false },
    { date: new Date(`${currentYear}-12-31`), name: "New Year's Eve", isOptional: true },
  ];

  for (const h of holidays) {
    try {
      await Holiday.findOrCreate({
        where: { date: h.date },
        defaults: h,
      });
      console.log(`✅ Added holiday: ${h.name} (${h.date.toISOString().split('T')[0]})`);
    } catch (err: any) {
      console.error(`❌ Failed to add holiday ${h.name}:`, err.message);
    }
  }

  console.log('Holidays seeded successfully!');
  process.exit(0);
};

seedHolidays().catch((err) => {
  console.error('Seeding holidays failed:', err);
  process.exit(1);
});
