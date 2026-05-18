import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, syncDB, sequelize } from './config/sequelize';
import authRoutes from './routes/authRoutes';
import leaveRoutes from './routes/leaveRoutes';
import holidayRoutes from './routes/holidayRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import { initScheduler } from './services/schedulerService';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

syncDB();

app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Leave Management API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initScheduler();
  console.log('Manager Credentials:');
  console.log('Manager: manager@company.com / manager123');
  console.log('HR:      hr@company.com / hr123456');
  console.log('Admin:   admin@company.com / admin123');
  console.log('Employee: employee@company.com / employee123');
});