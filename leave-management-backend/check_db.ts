import dotenv from 'dotenv';
import User from './src/models/User';
import { connectDB } from './src/config/sequelize';

dotenv.config();

const check = async () => {
  await connectDB();
  const users = await User.findAll();
  console.log('Users in DB:');
  for (const u of users) {
    console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.password}`);
  }
  process.exit(0);
};

check();
