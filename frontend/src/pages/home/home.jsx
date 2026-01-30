import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import EmptyContainer from '../../components/emptyContainer/emptyContainer.jsx';
import Footer from '../../components/footer/footer.jsx';
import Header from '../../components/header/header.jsx';
import styles from './home.module.css';
import ProductsGrid from './products-grid.jsx';

const RECOMMENDATIONS_LIMIT = 24;

export default ({ cart, loadCart }) => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coldStart, setColdStart] = useState(true);
  const searchQuery = searchParams.get('search_query') || '';

  useEffect(() => {
    setLoading(true);
    if (searchQuery) {
      axios.get('/api/products').then((response) => {
        const searchTerm = searchQuery.toLowerCase();
        const filtered = response.data.filter((product) => {
          const searchData = (
            product.name +
            (product.keywords ? ' ' + product.keywords.join(' ') : '')
          ).toLowerCase();
          return searchData.includes(searchTerm);
        });
        setProducts(filtered);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      axios
        .get(`/api/recommendations?limit=${RECOMMENDATIONS_LIMIT}`)
        .then((response) => {
          const data = response.data;
          if (Array.isArray(data)) {
            setProducts(data);
            setColdStart(true);
          } else {
            setProducts(Array.isArray(data?.products) ? data.products : []);
            setColdStart(Boolean(data?.coldStart));
          }
          setLoading(false);
        })
        .catch(() => {
          axios.get('/api/products').then((res) => {
            setProducts(res.data.slice(0, RECOMMENDATIONS_LIMIT));
            setColdStart(true);
            setLoading(false);
          }).catch(() => setLoading(false));
        });
    }
  }, [searchQuery]);

  const sectionTitle = searchQuery
    ? 'Search results'
    : coldStart
      ? 'Trending now'
      : 'Recommended for you';

  return (
    <>
      <title>4YA Store</title>
      <Header cart={cart} />
      <div className={styles.homeMain}>
        <h2>{sectionTitle}</h2>
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : products.length <= 0 ? (
          <EmptyContainer
            message={'No results found \n  Try checking your spelling or using different keywords.'}
            link={'/'}
            redirectMessage={'Browse all products'}
          />
        ) : (
          <ProductsGrid products={products} loadCart={loadCart} />
        )}
      </div>
      <Footer />
    </>
  );
};
