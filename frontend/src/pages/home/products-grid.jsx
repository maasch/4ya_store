import styles from './home.module.css';
import Product from './Product';
export default ({ products, loadCart }) => {
  return (
    <div className={styles.productsGrid}>
      {products.length > 0 &&
        products.map((product) => (
          <Product key={product.id} product={product} loadCart={loadCart} />
        ))}
    </div>
  );
};
