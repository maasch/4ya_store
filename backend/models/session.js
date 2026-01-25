import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const Session = sequelize.define(
  'Session',
  {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    expires: {
      type: DataTypes.DATE,
    },
    data: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('data');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('data', JSON.stringify(value));
      },
    },
  },
  {
    timestamps: false,
    tableName: 'Sessions',
  }
);
