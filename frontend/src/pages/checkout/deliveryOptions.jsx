import axios from 'axios';
import dayjs from 'dayjs';
import formatMoney from '../../utils/money';
export default ({ cartItem, deliveryOptions, onUpdate }) => {
  const handleDeliveryOptionChange = async (deliveryOptionId) => {
    await axios.put(`/api/cart-items/${cartItem.productId}`, {
      deliveryOptionId,
    });
    await onUpdate();
  };

  return (
    <div className="delivery-options">
      <div className="delivery-options-title">Choose a delivery option:</div>
      <div className="delivery-options-grid">
        {deliveryOptions.map((deliveryOption) => {
          let priceString = 'FREE Shipping';

          if (deliveryOption.priceCents > 0) {
            priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
          }

          const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

          return (
            <div
              key={deliveryOption.id}
              className="delivery-option checked-js"
              data-product-id={cartItem.productId}
              data-delivery-id={deliveryOption.id}
              onClick={() => handleDeliveryOptionChange(deliveryOption.id)}
            >
              <input
                type="radio"
                checked={isChecked}
                onChange={() => handleDeliveryOptionChange(deliveryOption.id)}
                className={`delivery-option-input update-delivery-input-${cartItem.productId}-${deliveryOption.id}`}
                name={`delivery-option-${cartItem.productId}`}
              />
              <div>
                <div className="delivery-option-date">
                  {dayjs(deliveryOption.estimatedDeliveryTimeMs).format(
                    'dddd, MMMM D'
                  )}
                </div>
                <div className="delivery-option-price">{priceString}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
