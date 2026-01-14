import {orders} from '../data/orders.js';
import {moneyCurrn,updateCart} from './unit/money.js';
//import {dayjs} from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {products , loadProductsFetch, getProduct} from '../data/products.js';
import {cart} from '../data/cart-class.js';
import {searchClicked} from './unit/search-btn.js'

async function loadOrdersPage(){

  await loadProductsFetch();
  let ordersHTML='';

  orders.forEach((order)=>{
    ordersHTML+=
    `
    <div class="order-container">      
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${dayjs(order.orderTime).format('MMMM D')}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${moneyCurrn(order.totalCostCents)}</div>
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid">
        ${productsHTMLgenerator(order)}
        </div>
      </div>
    `;
  });

  function productsHTMLgenerator(order){
    let html = '';
    if (!Array.isArray(order.products)) {
      // Optionally, you can show a message or just return an empty string
      html += `<div class="product-details">No products found for this order.</div>`;
      return html;
    }
    order.products.forEach((product)=>{
      const matchProduct =  getProduct(product);
      html +=  `
      <div class="product-image-container">
        <img src=${matchProduct.image}>
      </div>

      <div class="product-details">
        <div class="product-name">
          ${matchProduct.name}
        </div>
        <div class="product-delivery-date">
          Arriving on: ${dayjs(product.estimatedDeliveryTime).format('MMMM D')}
        </div>
        <div class="product-quantity">
          Quantity: ${product.quantity}
        </div>
        <button class="buy-again-button button-primary js-buy-again" 
        data-product-id = "${product.productId}">
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        </button>
      </div>

      <div class="product-actions">
        <a href="tracking.html?orderId=${order.id}&productId=${matchProduct.id}">
          <button class="track-package-button button-secondary">
            Track package
          </button>
        </a>
      </div>`
      ;
    })
    return html;
  };

  document.querySelector('.js-orders-grid').innerHTML= ordersHTML;

  document.querySelectorAll('.js-buy-again')
  .forEach((span)=>{
  span.addEventListener('click', ()=>{
  const {productId} = span.dataset;
  cart.addToCarrt(productId);
  updateCart();
  span.innerHTML = 'Added';
  setTimeout(()=>{
    span.innerHTML=`
     <img class="buy-again-icon" src="images/icons/buy-again.png">
     <span class="buy-again-message">Buy it again</span>
    `
  },1000);

  })
 })
 updateCart();
}

loadOrdersPage();
searchClicked()

