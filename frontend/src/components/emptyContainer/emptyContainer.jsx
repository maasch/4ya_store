import { Link } from 'react-router';
import './emptyContainer.css';
export default ({ message, link, redirectMessage }) => {
  return (
    <div className="noResult">
      <div className="message">{message}</div>
      <Link to={link} className="redirect">
        <div id="text">{redirectMessage}</div>
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
    </div>
  );
};
