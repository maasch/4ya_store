import { Link } from 'react-router';
import './footer.css';

export default () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-section-title">Get to Know Us</h3>
          <ul className="footer-links">
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Press Releases</Link></li>
            <li><Link to="/">Investor Relations</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-section-title">Make Money with Us</h3>
          <ul className="footer-links">
            <li><Link to="/">Sell products</Link></li>
            <li><Link to="/">Become an Affiliate</Link></li>
            <li><Link to="/">Advertise Your Products</Link></li>
            <li><Link to="/">Self-Publish with Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-section-title">Customer Service</h3>
          <ul className="footer-links">
            <li><Link to="/">Help Center</Link></li>
            <li><Link to="/">Returns & Refunds</Link></li>
            <li><Link to="/">Shipping Information</Link></li>
            <li><Link to="/">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-section-title">Connect with Us</h3>
          <div className="social-links">
            <a
              href="https://www.facebook.com/profile.php?id=61587167156340"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://x.com/4YA_Agency"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="X"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.27 22.464L1.5 1.536h5.23L22.5 22.464zm4.488-20.928l-8.313 8.915M2.242 22.464l8.307-8.908"
                  strokeWidth={2}
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/4ya.agency/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@4ya_agancy"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Tiktok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="#fff" d="M412.19 118.66a109 109 0 0 1-9.45-5.5a133 133 0 0 1-24.27-20.62c-18.1-20.71-24.86-41.72-27.35-56.43h.1C349.14 23.9 350 16 350.13 16h-82.44v318.78c0 4.28 0 8.51-.18 12.69c0 .52-.05 1-.08 1.56c0 .23 0 .47-.05.71v.18a70 70 0 0 1-35.22 55.56a68.8 68.8 0 0 1-34.11 9c-38.41 0-69.54-31.32-69.54-70s31.13-70 69.54-70a68.9 68.9 0 0 1 21.41 3.39l.1-83.94a153.14 153.14 0 0 0-118 34.52a161.8 161.8 0 0 0-35.3 43.53c-3.48 6-16.61 30.11-18.2 69.24c-1 22.21 5.67 45.22 8.85 54.73v.2c2 5.6 9.75 24.71 22.38 40.82A167.5 167.5 0 0 0 115 470.66v-.2l.2.2c39.91 27.12 84.16 25.34 84.16 25.34c7.66-.31 33.32 0 62.46-13.81c32.32-15.31 50.72-38.12 50.72-38.12a158.5 158.5 0 0 0 27.64-45.93c7.46-19.61 9.95-43.13 9.95-52.53V176.49c1 .6 14.32 9.41 14.32 9.41s19.19 12.3 49.13 20.31c21.48 5.7 50.42 6.9 50.42 6.9v-81.84c-10.14 1.1-30.73-2.1-51.81-12.61" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-logo">
            <Link to="/">
              <span className="footer-logo-text">4YA Store</span>
            </Link>
          </div>
          <div className="footer-copyright">
            <p>&copy; {currentYear} 4YA Store. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <span className="footer-divider">|</span>
            <Link to="/">Terms of Service</Link>
            <span className="footer-divider">|</span>
            <Link to="/">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
