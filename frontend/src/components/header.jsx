import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import './header.css';

export default ({ cart }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search_query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="amazon-header">
      <div className="amazon-header-left-section">
        <Link to="/" className="header-link">
          <img className="amazon-logo" src="images/amazon-logo-white.png" />
          <img
            className="amazon-mobile-logo"
            src="images/amazon-mobile-logo-white.png"
          />
        </Link>
      </div>

      <div className="amazon-header-middle-section">
        <input
          className="search-bar user-search"
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="search-button js-search-btn" onClick={handleSearch}>
          <img className="search-icon" src="images/icons/search-icon.png" />
        </button>
      </div>

      <div className="amazon-header-right-section">
        <Link className="orders-link header-link" to="/orders">
          <span className="returns-text">Returns</span>
          <span className="orders-text">& Orders</span>
        </Link>

        <Link className="cart-link header-link" to="/checkout">
          <img className="cart-icon" src="images/icons/cart-icon.png" />
          <div className="cart-quantity js-cart-quantity">{totalQuantity}</div>
          <div className="cart-text">Cart</div>
        </Link>
      </div>
    </div>
  );
};
