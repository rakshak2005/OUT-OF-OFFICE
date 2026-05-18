import User from './User';
import LeaveType from './LeaveType';
import LeaveBalance from './LeaveBalance';
import Leave from './Leave';
import Holiday from './Holiday';

User.hasMany(Leave, { foreignKey: 'userId', as: 'leaves' });
User.hasMany(LeaveBalance, { foreignKey: 'userId', as: 'leaveBalances' });
User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

LeaveType.hasMany(LeaveBalance, { foreignKey: 'leaveTypeId', as: 'balances' });
LeaveType.hasMany(Leave, { foreignKey: 'leaveTypeId', as: 'leaves' });

LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });
LeaveBalance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, LeaveType, LeaveBalance, Leave, Holiday };