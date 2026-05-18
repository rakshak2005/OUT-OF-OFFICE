import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import User from './User';
import LeaveType from './LeaveType';

interface LeaveAttributes {
  id?: string;
  userId: string;
  leaveTypeId: string;
  fromDate: Date;
  toDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedAt?: Date;
  decidedBy?: string;
  decidedAt?: Date;
  decisionRemark?: string;
  documentPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeaveCreationAttributes
  extends Optional<LeaveAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Leave
  extends Model<LeaveAttributes, LeaveCreationAttributes>
  implements LeaveAttributes {
  public id!: string;
  public userId!: string;
  public leaveTypeId!: string;
  public fromDate!: Date;
  public toDate!: Date;
  public totalDays!: number;
  public reason!: string;
  public status!: 'pending' | 'approved' | 'rejected' | 'cancelled';
  public appliedAt?: Date;
  public decidedBy?: string;
  public decidedAt?: Date;
  public decisionRemark?: string;
  public documentPath?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Leave.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    leaveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'LeaveTypes',
        key: 'id',
      },
    },
    fromDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    toDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000],
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending',
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    decidedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    decidedAt: {
      type: DataTypes.DATE,
    },
    decisionRemark: {
      type: DataTypes.TEXT,
    },
    documentPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Leaves',
    timestamps: true,
  }
);

Leave.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });
Leave.belongsTo(User, { foreignKey: 'decidedBy', as: 'approver' });
Leave.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

export default Leave;