require('dotenv').config();

const sslEnabled = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;
const dialectOptions = sslEnabled ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

const dialect = process.env.SEQUELIZE_DIALECT || 'postgres';

const sqliteConfig = {
  dialect: 'sqlite',
  storage: './database.sqlite'
};

const postgresConfig = {
  url: process.env.DATABASE_URL || null,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '09280928',
  database: process.env.DB_NAME || 'leave_management',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: dialectOptions
};

module.exports = {
  development: dialect === 'sqlite' ? sqliteConfig : postgresConfig,
  production: dialect === 'sqlite' ? sqliteConfig : postgresConfig
};
