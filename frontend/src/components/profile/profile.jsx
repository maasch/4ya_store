import axios from 'axios';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import './profile.css';

export default ({ user, update, isOpen, onClose }) => {
  const dropdownRef = useRef(null);

  async function handleLogOut() {
    await axios.post('/api/login/logout')
    update({
      isAuthenticated: false,
      user: {}
    })
    onClose();
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click was on the account link
        const accountLink = event.target.closest('.account-link');
        if (!accountLink) {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="userProfile">
      <div className="profile-header">
        <p className="pf-name">{user.name}</p>
        <p className="pf-email">{user.email}</p>
      </div>
      <div className="profile-divider"></div>
      <Link to="/orders" className="profile-link" onClick={onClose}>
        Your Orders
      </Link>
      <Link to="/checkout" className="profile-link" onClick={onClose}>
        Your Cart
      </Link>
      <Link to="/tracking" className="profile-link" onClick={onClose}>
        Track Package
      </Link>
      <div className="profile-divider"></div>
      <button className="profile-logout" onClick={handleLogOut}>
        Log out
      </button>
    </div>
  )
}
