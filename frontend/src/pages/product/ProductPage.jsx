import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import EmptyContainer from '../../components/emptyContainer/emptyContainer.jsx';
import Footer from '../../components/footer/footer.jsx';
import Header from '../../components/header/header.jsx';
import formatCurrency from '../../utils/money.js';
import styles from './product.module.css';

export default ({ cart, loadCart }) => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);
  const timeoutRef = useRef(null);

  // Scroll to top when entering the page or when productId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Update document title based on loading, error, or product state
  useEffect(() => {
    if (loading) {
      document.title = 'Loading Product... - 4YA Store';
    } else if (error || !product) {
      document.title = 'Product Not Found - 4YA Store';
    } else {
      document.title = `${product.name} - 4YA Store`;
    }
    return () => {
      document.title = '4YA Store';
    };
  }, [loading, error, product]);

  useEffect(() => {
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Product not found');
        } else {
          setError('Failed to load product');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const addToCart = async () => {
    if (!product || product.stock === 0) return;

    try {
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
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const selectQuantity = (event) => {
    const newQuantity = Number(event.target.value);
    const maxQuantity = Math.min(product.stock, 10);
    setQuantity(Math.min(newQuantity, maxQuantity));
  };

  const getStockStatus = () => {
    if (!product) return null;
    if (product.stock === 0) {
      return { text: 'Out of Stock', className: styles.stockOut };
    } else if (product.stock <= 10) {
      return { text: `Only ${product.stock} left!`, className: styles.stockLow };
    } else {
      return { text: 'In Stock', className: styles.stockIn };
    }
  };

  const getMaxQuantity = () => {
    if (!product) return 10;
    return Math.min(product.stock, 10);
  };

  if (loading) {
    return (
      <>
        <Header cart={cart} />
        <div className="main">
          <div className={styles.productPage}>
            <div className={styles.loadingContainer}>
              <p>Loading product...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <title>Product Not Found</title>
        <Header cart={cart} />
        <div className="main">
          <div className={styles.productPage}>
            <EmptyContainer
              message={error || 'Product not found'}
              link="/"
              redirectMessage="Back to Home"
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stockStatus = getStockStatus();
  const maxQuantity = getMaxQuantity();

  return (
    <>
      <Header cart={cart} />
      <div className="main">
        <div className={styles.productPage}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <Link to={`/?search_query=${encodeURIComponent(product.category)}`}>
              {product.category}
            </Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span>{product.name}</span>
          </div>

          {/* Main Product Grid */}
          <div className={styles.productGrid}>
            {/* Image Section */}
            <div className={styles.productImageSection}>
              <div className={styles.productImageContainer}>
                <img
                  className={styles.productImage}
                  src={product.image}
                  alt={product.name}
                />
              </div>
            </div>

            {/* Information Section */}
            <div className={styles.productInfoSection}>
              <h1 className={styles.productName}>{product.name}</h1>

              {/* Brand & Category */}
              <div className={styles.brandCategoryContainer}>
                <span className={styles.brandBadge}>{product.brand}</span>
                <span className={styles.categoryBadge}>
                  {product.category} › {product.subCategory}
                </span>
              </div>

              {/* Rating */}
              <div className={styles.ratingSection}>
                <img
                  className={styles.ratingStars}
                  src={`images/ratings/rating-${product.rating.stars * 10}.png`}
                  alt={`${product.rating.stars} stars`}
                />
                <span className={styles.ratingCount}>
                  ({product.rating.count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className={styles.priceSection}>
                {formatCurrency(product.priceCents)}
              </div>

              {/* Stock Status */}
              {stockStatus && (
                <div className={`${styles.stockStatus} ${stockStatus.className}`}>
                  {stockStatus.text}
                </div>
              )}

              {/* Purchase Section */}
              <div className={styles.purchaseSection}>
                <div className={styles.quantityContainer}>
                  <label htmlFor="quantity-select" className={styles.quantityLabel}>
                    Quantity:
                  </label>
                  <select
                    id="quantity-select"
                    value={quantity}
                    onChange={selectQuantity}
                    className={styles.quantitySelect}
                    disabled={product.stock === 0}
                  >
                    {Array.from({ length: maxQuantity }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className={`${styles.addToCartButton} button-primary`}
                  onClick={addToCart}
                  disabled={product.stock === 0 || showAdded}
                >
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
                  {showAdded ? (
                    <>
                      Added to Cart
                    </>
                  ) : (
                    <>
                     
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Keywords */}
              {product.keywords && product.keywords.length > 0 && (
                <div className={styles.keywordsSection}>
                  <span className={styles.keywordsLabel}>Tags:</span>
                  <div className={styles.keywordsContainer}>
                    {product.keywords.map((keyword, index) => (
                      <Link
                        key={index}
                        to={`/?search_query=${encodeURIComponent(keyword)}`}
                        className={styles.keywordTag}
                      >
                        #{keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className={styles.productDetailsSection}>
            <h2 className={styles.detailsTitle}>Product Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category:</span>
                <span className={styles.detailValue}>
                  {product.category} › {product.subCategory}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Brand:</span>
                <span className={styles.detailValue}>{product.brand}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Stock:</span>
                <span className={styles.detailValue}>
                  {product.stock} units available
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Product ID:</span>
                <span className={styles.detailValueId}>{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
