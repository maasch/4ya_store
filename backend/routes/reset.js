import express from 'express';
import { defaultDeliveryOptions } from '../defaultData/defaultDeliveryOptions.js';
import { defaultProducts } from '../defaultData/defaultProducts.js';
import { DeliveryOption } from '../models/DeliveryOption.js';
import { sequelize } from '../models/index.js';
import { Product } from '../models/Product.js';

const router = express.Router();

router.post('/', async (req, res) => {
  await sequelize.sync({ force: true });

  const timestamp = Date.now();

  const productsWithTimestamps = defaultProducts.map((product, index) => ({
    ...product,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  const deliveryOptionsWithTimestamps = defaultDeliveryOptions.map((option, index) => ({
    ...option,
    createdAt: new Date(timestamp + index),
    updatedAt: new Date(timestamp + index)
  }));

  await Product.bulkCreate(productsWithTimestamps);
  await DeliveryOption.bulkCreate(deliveryOptionsWithTimestamps);

  res.status(204).send();
});

export default router;
