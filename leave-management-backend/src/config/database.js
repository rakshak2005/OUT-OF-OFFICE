require('dotenv').config();

const sslEnabled = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;
const dialectOptions = sslEnabled ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

module.exports = {
  development: {
    url: process.env.DATABASE_URL || null,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '09280928',
    database: process.env.DB_NAME || 'leave_management',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: dialectOptions
  },
  production: {
    url: process.env.DATABASE_URL || null,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: dialectOptions
  }
};
