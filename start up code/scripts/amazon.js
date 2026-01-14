import {cart} from '../data/cart-class.js';
import {products, loadProductsArry, loadProductsFetch} from '../data/products.js';
import {moneyCurrn,updateCart} from './unit/money.js';
import { searchClicked } from './unit/search-btn.js';



const urlParams = new URLSearchParams(window.location.search)

const key = urlParams.get('search_query')||'';


async function displayPage(){
  await loadProductsFetch();
  let filteredProducts = products;
  
  if(key){
    const searchTerm = key.toLowerCase();

    filteredProducts = products.filter((productData)=>{
      const searchData = (productData.name + productData.keywords.join(' ')).toLowerCase();
      console.log(searchData)
      return searchData.toLowerCase().includes(searchTerm)
    }) 
  }
  renderProductsGrid(filteredProducts);
};

displayPage();

searchClicked();

function renderProductsGrid(products){
  let html='';
  products.forEach((product)=>{
    html+=`
    <div class="product-container">
            <div class="product-image-container">
              <img class="product-image"
                src=${product.image}>
            </div>

            <div class="product-name limit-text-to-2-lines">
              ${product.name}
            </div>

            <div class="product-rating-container">
              <img class="product-rating-stars"
                src="${product.getImageUrl()}">
              <div class="product-rating-count link-primary">
                ${product.rating.count}
              </div>
            </div>

            <div class="product-price">
              ${product.getPrice()}
            </div>

            <div class="product-quantity-container">
              <select class="js-quantity-selected-${product.id}">
                <option selected value="1">1</option>
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

            <div class="product-spacer">
            ${product.getSizeChartTable()}
            </div>

            <div class="added-to-cart js-added-to-cart-${product.id}">
              <img src="images/icons/checkmark.png">
              Added
            </div>

            <button class="add-to-cart-button button-primary add-to-cart-js"
            data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>
    `;
  })
  document.querySelector('.products-grid').innerHTML = html ;
  
  updateCart()

  function displayAdded(productId){
    document.querySelector(`.js-added-to-cart-${productId}`)
    .classList.add('js-added-to-cart');

    setTimeout(()=>{
      const previousTimeoutId = timeoutsList[productId];
      if (previousTimeoutId) {
        clearTimeout(previousTimeoutId);
      }

      const timeout=setTimeout(()=>{
        document.querySelector(`.js-added-to-cart-${productId}`)
          .classList.remove('js-added-to-cart');
      },2000);

      timeoutsList[productId]=timeout;
    });  
  }

  const timeoutsList={};

  document.querySelectorAll('.add-to-cart-js')
  .forEach((btn)=>{
      const {productId} = btn.dataset;
      btn.addEventListener('click',()=>{
        cart.addToCart(productId);
        updateCart();
        displayAdded(productId);  
    });
  });
}