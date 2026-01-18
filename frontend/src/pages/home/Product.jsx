import axios from 'axios';
import { useState, useRef } from 'react';
import formatCurrency from '../../utils/money.js';
import styles from './home.module.css';

export default ({ product, loadCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const timeoutRef = useRef(null);

  const addToCart = async () => {
    await axios.post('/api/cart-items', {
      productId: product.id,
      quantity,
    });
    await loadCart();
    
    // Show "Added to cart" message
    setShowAdded(true);
    
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Hide after 2 seconds
    timeoutRef.current = setTimeout(() => {
      setShowAdded(false);
    }, 2000);
  };

  const selectQuantity = (event) => {
    const quantitySelected = Number(event.target.value);
    setQuantity(quantitySelected);
  };

  const renderSizeChart = () => {
    if (product.type === 'clothing' && product.sizeChartLink) {
      return (
        <a href={product.sizeChartLink} target="_blank" rel="noopener noreferrer">
          Size Chart
        </a>
      );
    }
    if (product.type === 'Appliance') {
      return (
        <>
          {product.instructionsLink && (
            <>
              <a href={product.instructionsLink} target="_blank" rel="noopener noreferrer">
                Instructions
              </a>
              <br />
            </>
          )}
          {product.warrantyLink && (
            <a href={product.warrantyLink} target="_blank" rel="noopener noreferrer">
              Warranty
            </a>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className={styles.productContainer}>
      <div className={styles.productImageContainer}>
        <img
          loading="lazy"
          className={styles.productImage}
          src={product.image}
        />
      </div>

      <div className={`${styles.productName} limit-text-to-2-lines`}>
        {product.name}
      </div>

      <div className={styles.productRatingContainer}>
        <img
          className={styles.productRatingStars}
          src={`images/ratings/rating-${product.rating.stars * 10}.png`}
        />
        <div className={`${styles.productRatingCount} link-primary`}>
          {product.rating.count}
        </div>
      </div>

      <div className={styles.productPrice}>
        {formatCurrency(product.priceCents)}
      </div>

      <div className={styles.productQuantityContainer}>
        <select
          value={quantity}
          onChange={selectQuantity}
          className={`js-quantity-selected-${product.id}`}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className={styles.productSpacer}>
        {renderSizeChart()}
      </div>

      <div className={`${styles.addedToCart} ${showAdded ? styles.jsAddedToCart : ''}`}>
        <img src="images/icons/checkmark.png" />
        Added
      </div>

      <button
        className={`${styles.addToCartButton} button-primary add-to-cart-js`}
        data-product-id={product.id}
        onClick={addToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};
