import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Header from '../../components/header/header.jsx';
import styles from './home.module.css';
import ProductsGrid from './products-grid.jsx';

export default ({ cart, loadCart }) => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const searchQuery = searchParams.get('search_query') || '';

  useEffect(() => {
    axios.get('/api/products').then((response) => {
      let allProducts = response.data;

      // Filter products based on search query
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        allProducts = allProducts.filter((product) => {
          const searchData = (
            product.name +
            (product.keywords ? ' ' + product.keywords.join(' ') : '')
          ).toLowerCase();
          return searchData.includes(searchTerm);
        });
      }

      setProducts(allProducts);
    });
  }, [searchQuery]);

  return (
    <>
      <title>4YA Store</title>
      <Header cart={cart} />
      <div className={styles.homeMain}>
        <h2>Trending Now</h2>
        <ProductsGrid products={products} loadCart={loadCart} />
      </div>
    </>
  );
};
