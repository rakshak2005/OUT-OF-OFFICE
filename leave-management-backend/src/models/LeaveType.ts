import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface LeaveTypeAttributes {
  id?: string;
  name: string;
  annualQuota: number;
  carryForwardMax: number;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeaveTypeCreationAttributes
  extends Optional<LeaveTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class LeaveType
  extends Model<LeaveTypeAttributes, LeaveTypeCreationAttributes>
  implements LeaveTypeAttributes {
  public id!: string;
  public name!: string;
  public annualQuota!: number;
  public carryForwardMax!: number;
  public isPaid!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    annualQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    carryForwardMax: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'LeaveTypes',
    timestamps: true,
  }
);

export default LeaveType;