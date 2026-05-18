import { Request, Response } from 'express';
import { User, LeaveBalance, Leave, LeaveType } from '../models';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const currentYear = new Date().getFullYear();
    const types = await LeaveType.findAll();

    const usersWithBalance = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toJSON() as any;
        const balances = await LeaveBalance.findAll({ where: { userId: user.id, year: currentYear } });
        const leaveBalance = { casual: 0, sick: 0, annual: 0, total: 0 };

        for (const type of types) {
          const name = type.name.toLowerCase();
          const balance = balances.find((b: any) => b.leaveTypeId === type.id);
          const remaining = balance ? balance.remaining : type.annualQuota;

          if (name.includes('casual')) leaveBalance.casual = remaining;
          else if (name.includes('sick')) leaveBalance.sick = remaining;
          else if (name.includes('annual')) leaveBalance.annual = remaining;
        }

        leaveBalance.total = leaveBalance.casual + leaveBalance.sick + leaveBalance.annual;
        userObj.leaveBalance = leaveBalance;
        return userObj;
      })
    );

    res.json(usersWithBalance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id as string);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (user.id === (req as any).user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    
    
    
    await LeaveBalance.destroy({ where: { userId: id } });
    await Leave.destroy({ where: { userId: id } });
    
    await user.destroy();

    res.json({ message: 'User account deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserLeaves = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const leaves = await Leave.findAll({
      where: { userId: id },
      include: [
        { model: require('../models').LeaveType, as: 'leaveType' },
        { model: User, as: 'approver', attributes: ['firstName', 'lastName'] }
      ],
      order: [['fromDate', 'DESC']]
    });
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserLeaveBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { casual, sick, annual } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentYear = new Date().getFullYear();
    const types = await LeaveType.findAll();

    for (const type of types) {
      const name = type.name.toLowerCase();
      let targetValue = 0;
      
      if (name.includes('casual')) {
        targetValue = casual;
      } else if (name.includes('sick')) {
        targetValue = sick;
      } else if (name.includes('annual')) {
        targetValue = annual;
      } else {
        continue;
      }

      
      let balance = await LeaveBalance.findOne({
        where: { userId: id, leaveTypeId: type.id, year: currentYear }
      });

      if (balance) {
        balance.remaining = targetValue;
        await balance.save();
      } else {
        
        await LeaveBalance.create({
          userId: id,
          leaveTypeId: type.id,
          year: currentYear,
          remaining: targetValue,
          allocated: targetValue,
          used: 0,
          carriedForward: 0
        });
      }
    }

    res.json({ message: 'Leave balances altered successfully' });
  } catch (error: any) {
    console.error('Update leave balance error:', error);
    res.status(500).json({ message: error.message || 'Failed to alter leave balances' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      department: department || 'Operations',
    });

    res.status(201).json({
      message: 'User account created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ message: error.message || 'Failed to create user' });
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'User password updated successfully' });
  } catch (error: any) {
    console.error('Change user password error:', error);
    res.status(500).json({ message: error.message || 'Failed to update password' });
  }
};
