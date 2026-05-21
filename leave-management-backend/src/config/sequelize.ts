import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sslEnabled = process.env.DB_SSL === 'true' || !!databaseUrl;
const dialect = process.env.SEQUELIZE_DIALECT || 'postgres';

export const sequelize = dialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
    })
  : databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
      timezone: '+05:30',
      dialectOptions: sslEnabled ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'leave_management',
      username: process.env.DB_USER || 'leave_admin',
      password: process.env.DB_PASSWORD || 'leave_admin_password',
      logging: process.env.SEQUELIZE_LOGGING === 'true' ? console.log : false,
      timezone: '+05:30',
      dialectOptions: sslEnabled ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`${dialect === 'sqlite' ? 'SQLite' : 'PostgreSQL'} connected successfully`);
  } catch (error) {
    console.error(`Unable to connect to database:`, error);
    process.exit(1);
  }
};

export const syncDB = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synced');
    }
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};