import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import EmptyContainer from '../../components/emptyContainer/emptyContainer.jsx';
import Footer from '../../components/footer/footer.jsx';
import Header from '../../components/header/header.jsx';
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
          <div className="order-tracking">
            <div className="delivery-date-trk">
              Track Your Package
            </div>
            <EmptyContainer
              message="Order not found. Please check your order ID and try again."
              link="/orders"
              redirectMessage="View Your Orders"
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentTime = dayjs();
  const orderTime = dayjs(order.orderTimeMs);
  const deliveryTime = dayjs(orderProduct.estimatedDeliveryTimeMs);
  const deliveryTimeIn = deliveryTime.valueOf() - orderTime.valueOf();
  const orderedAgo = currentTime.valueOf() - orderTime.valueOf();

  const deliveryMessage =
    orderedAgo < deliveryTimeIn ? 'Arriving on' : 'Delivered on';
  let progress =
    deliveryTimeIn > 0
      ? Math.min(100, Math.max(0, (orderedAgo / deliveryTimeIn) * 100))
      : 100;

  let currentStatus = 'preparing';
  if (progress > 49 && progress <= 99) {
    currentStatus = 'shipped';
  } else if (progress > 99) {
    currentStatus = 'delivered';
  }

  // Show delivery date or order date based on status
  const displayDate =
    orderedAgo < deliveryTimeIn
      ? deliveryTime.format('dddd, MMMM D')
      : orderTime.format('dddd, MMMM D');

  return (
    <>
      <title>Tracking</title>
      <Header cart={cart} />
      <div className="main">
        <div className="order-tracking">
          <Link className="back-to-orders-link" to="/orders">
            <span>View all orders</span>
            <svg
              className="arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="#019300"
                d="M12.727 3.687a1 1 0 1 0-1.454-1.374l-8.5 9a1 1 0 0 0 0 1.374l8.5 9.001a1 1 0 1 0 1.454-1.373L4.875 12z"
              />
            </svg>
          </Link>

          <div className="delivery-date-trk">
            {deliveryMessage} {displayDate}
          </div>

          <div className="product-cont">
            <img className="product-image-trk" src={product.image} />
            <div className="product-info">
              <div>{product.name}</div>
              <div>Quantity : {orderProduct.quantity}</div>
            </div>
          </div>

          <div className="progress-labels-container">
            <div
              className={`progress-label preparing ${currentStatus === 'preparing' ? 'current-status' : ''}`}
            >
              Preparing
            </div>
            <div
              className={`progress-label shipped ${currentStatus === 'shipped' ? 'current-status' : ''}`}
            >
              Shipped
            </div>
            <div
              className={`progress-label delivered ${currentStatus === 'delivered' ? 'current-status' : ''}`}
            >
              Delivered
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
