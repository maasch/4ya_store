import axios from 'axios'
import { useEffect, useState } from 'react'
import Header from '../../components/header.jsx'
import formaCurrency from '../../utils/money.js'
import styles from './home.module.css'
export default () => {
  const [products, setProducts] = useState([])
  useEffect(() => {
    axios.get('/api/products')
      .then(response => {
        setProducts(response.data)
      })
  }, [])
  return (
    <>
      <title>4YA Store</title>
      <Header />
      <div className={styles.homeMain}>
        <div className={styles.productsGrid}>

          {products.length > 0 && products.map(product =>
            <div key={product.id} className={styles.productContainer}>
              <div className={styles.productImageContainer}>
                <img loading="lazy" className={styles.productImage} src={product.image} />
              </div>

              <div className={`${styles.productName} limit-text-to-2-lines`}>
                {product.name}
              </div>

              <div className={styles.productRatingContainer}>
                <img className={styles.productRatingStars} src={`images/ratings/rating-${product.rating.stars * 10}.png`} />
                <div className={`${styles.productRatingCount} link-primary`}>
                  {product.rating.count}
                </div>
              </div>

              <div className={styles.productPrice}>
                {formaCurrency(product.priceCents)}
              </div>

              <div className={styles.productQuantityContainer}>
                <select className="js-quantity-selected-e43638ce-6aa0-4b85-b27f-e1d07eb678c6">
                  <option selected="" value="1">1</option>
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

              <div className={styles.productSpacer}>

              </div>

              <div className={`${styles.addedToCart} js-added-to-cart-e43638ce-6aa0-4b85-b27f-e1d07eb678c6`}>
                <img src="images/icons/checkmark.png" />
                Added
              </div>

              <button className={`${styles.addToCartButton} button-primary add-to-cart-js`} data-product-id="e43638ce-6aa0-4b85-b27f-e1d07eb678c6">
                Add to Cart
              </button>
            </div>
          )
          }


        </div>
      </div>
    </>
  )
}
