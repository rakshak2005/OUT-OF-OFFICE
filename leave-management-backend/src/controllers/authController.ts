import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, LeaveBalance, LeaveType } from '../models';
import { emailService } from '../services/emailService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });
};

const attachLeaveBalance = async (userObj: any, userId: string) => {
  const currentYear = new Date().getFullYear();
  const balances = await LeaveBalance.findAll({ where: { userId, year: currentYear } });
  const types = await LeaveType.findAll();
  
  const leaveBalance = { casual: 0, sick: 0, annual: 0, total: 0 };
  
  types.forEach((type: any) => {
    const name = type.name.toLowerCase();
    const balance = balances.find((b: any) => b.leaveTypeId === type.id);
    
    const remaining = balance ? balance.remaining : type.annualQuota;
    
    if (name.includes('casual')) leaveBalance.casual = remaining;
    else if (name.includes('sick')) leaveBalance.sick = remaining;
    else if (name.includes('annual')) leaveBalance.annual = remaining;
  });

  leaveBalance.total = leaveBalance.casual + leaveBalance.sick + leaveBalance.annual;
  
  userObj.leaveBalance = leaveBalance;
  return userObj;
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, department, role, joiningCode } = req.body;

    
    const systemJoiningCode = process.env.JOINING_CODE || 'OOO-2024';
    if (joiningCode !== systemJoiningCode) {
      return res.status(400).json({ message: 'Invalid joining code. Please contact your administrator.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      department,
      role: role || 'employee',
    });

    const token = generateToken(user.id);

    let userObj = user.toJSON();
    delete (userObj as any).password;
    userObj = await attachLeaveBalance(userObj, user.id);

    res.status(201).json({
      ...userObj,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt: ${email}`);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.comparePassword(password);

    console.log(`Password match for ${email}: ${isPasswordMatch}`);

    if (isPasswordMatch) {
      const token = generateToken(user.id);

      let userObj = user.toJSON();
      delete (userObj as any).password;
      userObj = await attachLeaveBalance(userObj, user.id);

      res.json({
        ...userObj,
        token,
      });

      emailService.sendLoginNotificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' IST'
      ).catch(err => console.error('Error sending login email:', err));
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);
    let userObj = user?.toJSON();
    if (userObj) {
      delete (userObj as any)?.password;
      userObj = await attachLeaveBalance(userObj, user!.id);
    }
    res.json(userObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};