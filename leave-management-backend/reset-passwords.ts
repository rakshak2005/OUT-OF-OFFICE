import { User } from './src/models';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function resetPasswords() {
  try {
    const salt = await bcrypt.genSalt(10);
    
    const users = [
      { email: 'manager@company.com', password: 'manager123' },
      { email: 'hr@company.com', password: 'hr123456' },
      { email: 'admin@company.com', password: 'admin123' },
      { email: 'employee@company.com', password: 'employee123' },
    ];

    for (const u of users) {
      const user = await User.findOne({ where: { email: u.email } });
      if (user) {
        user.password = u.password; 
        await user.save();
        console.log(`✅ Reset password for ${u.email}`);
      } else {
        console.log(`❌ User not found: ${u.email}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
