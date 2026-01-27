import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Uncategorized',
    },
    subCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General',
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown brand',
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    priceCents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keywords: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('keywords').split(',');
      },
      set(val) {
        this.setDataValue('keywords', val.join(','));
      },
    },
    createdAt: {
      type: DataTypes.DATE(3),
    },
    updatedAt: {
      type: DataTypes.DATE(3),
    },
  },
  {
    defaultScope: {
      order: [['createdAt', 'ASC']],
    },
  }
);
