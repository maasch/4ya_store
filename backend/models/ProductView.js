import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const ProductView = sequelize.define(
  'ProductView',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
  }
);
