import { Op } from 'sequelize';
import { Holiday, User } from '../models';
import { emailService } from './emailService';

export const checkAndSendHolidayReminders = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const holidaysTomorrow = await Holiday.findAll({
      where: {
        date: {
          [Op.between]: [tomorrowStart, tomorrowEnd],
        },
      },
    });

    if (holidaysTomorrow.length === 0) {
      console.log('📅 [Scheduler] No company holidays found scheduled for tomorrow.');
      return;
    }

    console.log(`📅 [Scheduler] Found ${holidaysTomorrow.length} holiday(s) for tomorrow. Fetching active organization accounts...`);
    const users = await User.findAll();

    for (const holiday of holidaysTomorrow) {
      const holidayDateStr = new Date(holiday.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      console.log(`📬 [Scheduler] Dispatching reminders for holiday: "${holiday.name}"`);
      
      for (const user of users) {
        emailService.sendHolidayReminderEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          holiday.name,
          holidayDateStr
        ).catch((err) =>
          console.error(`❌ [Scheduler] Error sending holiday email to ${user.email}:`, err)
        );
      }
    }
    
    console.log(`📅 [Scheduler] Dispatched holiday reminders successfully to ${users.length} accounts.`);
  } catch (error) {
    console.error('❌ [Scheduler] Error running holiday reminder cron job:', error);
  }
};

export const initScheduler = () => {
  console.log('⏰ [Scheduler] Background notification schedulers initialized successfully.');

  
  setTimeout(() => {
    console.log('📅 [Scheduler] Executing initial startup holiday reminder scan...');
    checkAndSendHolidayReminders();
  }, 5000);

  
  setInterval(() => {
    console.log('📅 [Scheduler] Executing scheduled daily holiday reminder scan...');
    checkAndSendHolidayReminders();
  }, 24 * 60 * 60 * 1000);
};
