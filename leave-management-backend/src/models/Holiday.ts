import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

interface HolidayAttributes {
  id?: string;
  date: Date;
  name: string;
  isOptional: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HolidayCreationAttributes
  extends Optional<HolidayAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Holiday
  extends Model<HolidayAttributes, HolidayCreationAttributes>
  implements HolidayAttributes {
  public id!: string;
  public date!: Date;
  public name!: string;
  public isOptional!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Holiday.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'Holidays',
    timestamps: true,
  }
);

export default Holiday;