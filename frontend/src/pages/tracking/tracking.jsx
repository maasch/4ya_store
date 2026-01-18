import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Header from '../../components/header.jsx';
import './tracking.css';

export default ({ cart }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');
  const [order, setOrder] = useState(null);
  const [orderProduct, setOrderProduct] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (orderId) {
      axios.get(`/api/orders/${orderId}?expand=products`).then((response) => {
        const orderData = response.data;
        setOrder(orderData);
        
        const matchOrderProduct = orderData.products.find(
          (op) => op.productId === productId
        );
        setOrderProduct(matchOrderProduct);
        
        if (matchOrderProduct && matchOrderProduct.product) {
          setProduct(matchOrderProduct.product);
        }
      });
    }
  }, [orderId, productId]);

  if (!order || !orderProduct || !product) {
    return (
      <>
        <title>Tracking</title>
        <Header cart={cart} />
        <div className="main">
          <div className="order-tracking">Loading...</div>
        </div>
      </>
    );
  }

  const currentTime = dayjs();
  const orderTime = dayjs(order.orderTimeMs);
  const deliveryTime = dayjs(orderProduct.estimatedDeliveryTimeMs);
  const deliveryTimeIn = deliveryTime.valueOf() - orderTime.valueOf();
  const orderedAgo = currentTime.valueOf() - orderTime.valueOf();
  
  const deliveryMessage = orderedAgo < deliveryTimeIn ? 'Arriving on' : 'Delivered on';
  let progress = deliveryTimeIn > 0 ? Math.min(100, Math.max(0, (orderedAgo / deliveryTimeIn) * 100)) : 100;

  let currentStatus = 'preparing';
  if (progress > 49 && progress <= 99) {
    currentStatus = 'shipped';
  } else if (progress > 99) {
    currentStatus = 'delivered';
  }

  // Show delivery date or order date based on status
  const displayDate = orderedAgo < deliveryTimeIn 
    ? deliveryTime.format('dddd, MMMM D')
    : orderTime.format('dddd, MMMM D');

  return (
    <>
      <title>Tracking</title>
      <Header cart={cart} />
      <div className="main">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to="/orders">
            View all orders
          </Link>

          <div className="delivery-date">
            {deliveryMessage} {displayDate}
          </div>

          <div className="product-info">{product.name}</div>

          <div className="product-info">Quantity: {orderProduct.quantity}</div>

          <img className="product-image" src={product.image} />

          <div className="progress-labels-container">
            <div className={`progress-label preparing ${currentStatus === 'preparing' ? 'current-status' : ''}`}>
              Preparing
            </div>
            <div className={`progress-label shipped ${currentStatus === 'shipped' ? 'current-status' : ''}`}>
              Shipped
            </div>
            <div className={`progress-label delivered ${currentStatus === 'delivered' ? 'current-status' : ''}`}>
              Delivered
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </>
  );
};
