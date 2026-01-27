import axios from 'axios';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import formatCurrency from '../../utils/money.js';
import styles from './home.module.css';

export default ({ product, loadCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const addToCart = async (e) => {
    e.preventDefault();      
    e.stopPropagation();
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
    setQuantity(Number(event.target.value));
  };

  const handleProductClick = (e) => {
    // Only navigate if clicking on non-interactive elements
    const target = e.target;
    const isInteractiveElement = 
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('select') ||
      target.closest('button');
    
    if (!isInteractiveElement) {
      navigate(`/product?id=${product.id}`);
    }
  };

  return (
    <div 
      className={styles.productContainer}
      onClick={handleProductClick}
    >
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

      {!showAdded ? (
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
      ) : (
        <div
          className={`${styles.addedToCart}
        ${showAdded ? styles.jsAddedToCart : ''}`}
        >
          <img src="images/icons/checkmark.png" />
          Added
        </div>
      )}

      <button
        className={`${styles.addToCartButton} button-primary add-to-cart-js`}
        data-product-id={product.id}
        onClick={addToCart}
      >
        <p>Add to Cart</p>
        <svg
          className={styles.addToCartIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
        >
          <path
            fill="#fff"
            d="M2.5 2a.5.5 0 0 0 0 1h.246a.5.5 0 0 1 .48.363l1.586 5.55A1.5 1.5 0 0 0 6.254 10h4.569a1.5 1.5 0 0 0 1.393-.943l1.474-3.686A1 1 0 0 0 12.762 4H4.448l-.261-.912A1.5 1.5 0 0 0 2.746 2zm4 12a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m4 0a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"
          />
        </svg>
      </button>
    </div>
  );
};
