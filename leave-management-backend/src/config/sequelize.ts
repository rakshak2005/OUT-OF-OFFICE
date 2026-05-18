import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'leave_management',
  username: process.env.DB_USER || 'leave_admin',
  password: process.env.DB_PASSWORD || 'leave_admin_password',
  logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
  timezone: '+05:30', 
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

export const syncDB = async () => {
  try {
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced');
    }
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};