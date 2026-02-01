import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Profile from '../profile/profile';
import './header.css';
export default ({ cart, userInfo, setUserInfo }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  let totalQuantity = 0;
  cart.forEach((cartItem) => {
    totalQuantity += cartItem.quantity;
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search_query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchMode(false);
    }

  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      setIsSearchMode(false);
      setSearchTerm('');
    }
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (!isSearchMode) {
      setSearchTerm('');
    }
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  return (
    <div className={`amazon-header ${isSearchMode ? 'search-mode-active' : ''}`}>
      <div className={`amazon-header-left-section ${isSearchMode ? 'hidden-mobile' : ''}`}>
        <Link to="/" className="logos">
          <img className="amazon-logo" src="images/4ya-logo.png" />
          <img
            className="amazon-mobile-logo"
            src="images/4ya-logo-mobile.png"
          />
        </Link>
      </div>

      <div className="amazon-header-middle-section">
        <input
          className={`search-bar user-search ${isSearchMode ? 'show-mobile' : ''}`}
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={isSearchMode}
        />

        <button
          className="search-button js-search-btn"
          onClick={isSearchMode ? (searchTerm.trim() ? handleSearch : toggleSearchMode) : toggleSearchMode}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.8em"
            height="1.8em"
            viewBox="0 0 16 16"
          >
            <path
              fill="#fff"
              d="m15.504 13.616l-3.79-3.223c-.392-.353-.811-.514-1.149-.499a6 6 0 1 0-.672.672c-.016.338.146.757.499 1.149l3.223 3.79c.552.613 1.453.665 2.003.115s.498-1.452-.115-2.003zM6 10a4 4 0 1 1 0-8a4 4 0 0 1 0 8"
            />
          </svg>
        </button>
      </div>

      <div className={`amazon-header-right-section ${isSearchMode ? 'search-mode-right' : ''}`}>
        {userInfo.isAuthenticated ? (
          <div className="account-container">
            <button
              className={`account-link header-link ${isSearchMode ? 'hidden-mobile' : ''}`}
              onClick={toggleProfile}
            >
              <div className="userInfo">
                <p className="name">{userInfo.user.name}</p>
              </div>

              <svg
                className="pfp-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.3"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2" />
                  <path d="M4.271 18.346S6.5 15.5 12 15.5s7.73 2.846 7.73 2.846M12 12a3 3 0 1 0 0-6a3 3 0 0 0 0 6" />
                </g>
              </svg>

            </button>
            <Profile
              user={userInfo.user}
              update={setUserInfo}
              isOpen={isProfileOpen}
              onClose={closeProfile}
            />
          </div>
        ) : (
          <Link className={`header-link not-auth ${isSearchMode ? 'hidden-mobile' : ''}`} to="/signin">
            <p className="signin"> Sign In</p>
          </Link>
        )}

        <Link className={`orders-link header-link ${isSearchMode ? 'hidden-mobile' : ''}`} to="/orders">
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
