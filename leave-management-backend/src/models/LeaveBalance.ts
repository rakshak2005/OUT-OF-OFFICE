import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface LeaveBalanceAttributes {
  id?: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
  carriedForward: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeaveBalanceCreationAttributes
  extends Optional<LeaveBalanceAttributes, 'id' | 'used' | 'carriedForward' | 'createdAt' | 'updatedAt'> {}

class LeaveBalance
  extends Model<LeaveBalanceAttributes, LeaveBalanceCreationAttributes>
  implements LeaveBalanceAttributes {
  public id!: string;
  public userId!: string;
  public leaveTypeId!: string;
  public year!: number;
  public allocated!: number;
  public used!: number;
  public remaining!: number;
  public carriedForward!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveBalance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    allocated: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    carriedForward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'LeaveBalances',
    timestamps: true,
  }
);

export default LeaveBalance;