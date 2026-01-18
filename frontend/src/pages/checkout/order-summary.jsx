import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import formatMoney from '../../utils/money.js';
import DeliveryOptions from './deliveryOptions.jsx';

export default ({ cart, deliveryOptions, onUpdate }) => {
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [quantityInputs, setQuantityInputs] = useState({});

  const handleUpdateClick = (productId, currentQuantity) => {
    setEditingQuantity(productId);
    setQuantityInputs(
      { ...quantityInputs, [productId]: currentQuantity.toString() });
  };

  const handleSaveQuantity = async (productId) => {
    const newQuantity = Number(quantityInputs[productId]);
    if (newQuantity >= 1 && newQuantity <= 10) {
      await axios.put(`/api/cart-items/${productId}`, {
        quantity: newQuantity,
      });
      setEditingQuantity(null);
      await onUpdate();
    }
  };

  const handleDelete = async (productId) => {
    await axios.delete(`/api/cart-items/${productId}`);
    await onUpdate();
  };

  const handleKeyDown = (event, productId) => {
    if (event.key === 'Enter') {
      handleSaveQuantity(productId);
    }
  };

  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 &&
        cart.map((cartItem) => {
          const selectedDeliveryOption = deliveryOptions.find(
            (deliveryOption) => {
              return deliveryOption.id === cartItem.deliveryOptionId;
            }
          );

          const isEditing = editingQuantity === cartItem.productId;

          return (
            <div
              key={cartItem.productId}
              className={`cart-item-container ${isEditing ? 'isEditig-quantity' : ''}`}
            >
              <div className="delivery-date">
                Delivery date:{' '}
                {selectedDeliveryOption && dayjs(selectedDeliveryOption.estimatedDeliveryTimeMs).format(
                  'dddd, MMMM D'
                )}
              </div>

              <div className="cart-item-details-grid">
                <img className="product-image" src={cartItem.product.image} />

                <div className="cart-item-details">
                  <div className="product-name">{cartItem.product.name}</div>
                  <div className="product-price">
                    {formatMoney(cartItem.product.priceCents)}
                  </div>
                  <div className="product-quantity">
                    <span>
                      Quantity:{' '}
                      <span className={`quantity-label quantity-label-${cartItem.productId}`}>
                        {cartItem.quantity}
                      </span>
                    </span>
                    <span
                      className="update-quantity-link link-primary js-update-quantity"
                      data-product-id={cartItem.productId}
                      onClick={() => handleUpdateClick(cartItem.productId, cartItem.quantity)}
                    >
                      Update
                    </span>
                    <input
                      className="quantity-input"
                      type="text"
                      value={quantityInputs[cartItem.productId] || ''}
                      onChange={(e) => setQuantityInputs({ ...quantityInputs, [cartItem.productId]: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, cartItem.productId)}
                      style={{ display: isEditing ? 'inline' : 'none' }}
                    />
                    <span
                      className="save-quantity link-primary"
                      data-product-id={cartItem.productId}
                      onClick={() => handleSaveQuantity(cartItem.productId)}
                      style={{ display: isEditing ? 'inline' : 'none' }}
                    >
                      Save
                    </span>
                    <span
                      className="delete-quantity-link link-primary js-delete-quantity"
                      data-product-id={cartItem.productId}
                      onClick={() => handleDelete(cartItem.productId)}
                    >
                      Delete
                    </span>
                  </div>
                </div>

                <DeliveryOptions
                  cartItem={cartItem}
                  deliveryOptions={deliveryOptions}
                  onUpdate={onUpdate}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};
