import axios from 'axios';
import dayjs from 'dayjs';
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Header from '../../components/header.jsx';
import formatMoney from '../../utils/money.js';
import './orders.css';

export default ({ cart, loadCart }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/orders?expand=products').then((response) => {
      setOrders(response.data);
    });
  }, []);

  const handleBuyAgain = async (productId) => {
    await axios.post('/api/cart-items', {
      productId,
      quantity: 1,
    });
    await loadCart();
  };

  return (
    <>
      <title>Orders</title>
      <Header cart={cart} />
      <div className="main">
        <div className="orders-page">
          <div className="page-title">Your Orders</div>

          <div className="orders-grid">
            {orders.map((order) => {
              return (
                <div key={order.id} className="order-container">
                  <div className="order-header">
                    <div className="order-header-left-section">
                      <div className="order-date">
                        <div className="order-header-label">Order Placed:</div>
                        <div>{dayjs(order.orderTimeMs).format('MMMM D')}</div>
                      </div>
                      <div className="order-total">
                        <div className="order-header-label">Total:</div>
                        <div>{formatMoney(order.totalCostCents)}</div>
                      </div>
                    </div>

                    <div className="order-header-right-section">
                      <div className="order-header-label">Order ID:</div>
                      <div>{order.id}</div>
                    </div>
                  </div>

                  <div className="order-details-grid">
                    {order.products.map((orderProduct) => {
                      const matchProduct = orderProduct.product;
                      
                      return (
                        <Fragment key={`${order.id}-${orderProduct.productId}`}>
                          <div className="product-image-container">
                            <img src={matchProduct.image} />
                          </div>

                          <div className="product-details">
                            <div className="product-name">
                              {matchProduct.name}
                            </div>
                            <div className="product-delivery-date">
                              Arriving on:{' '}
                              {dayjs(
                                orderProduct.estimatedDeliveryTimeMs
                              ).format('MMMM D')}
                            </div>
                            <div className="product-quantity">
                              Quantity: {orderProduct.quantity}
                            </div>
                            <button 
                              className="buy-again-button button-primary js-buy-again"
                              data-product-id={matchProduct.id}
                              onClick={() => handleBuyAgain(matchProduct.id)}
                            >
                              <img
                                className="buy-again-icon"
                                src="images/icons/buy-again.png"
                              />
                              <span className="buy-again-message">
                                Buy it again
                              </span>
                            </button>
                          </div>

                          <div className="product-actions">
                            <Link 
                              to={`/tracking?orderId=${order.id}&productId=${matchProduct.id}`}
                            >
                              <button className="track-package-button button-secondary">
                                Track package
                              </button>
                            </Link>
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
