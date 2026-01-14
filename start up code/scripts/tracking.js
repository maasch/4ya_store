import {orders} from '../data/orders.js';
import { loadProductsFetch, products } from '../data/products.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { updateCart } from './unit/money.js';
import { searchClicked } from './unit/search-btn.js';

const url = window.location.search;
const urlParams = new URLSearchParams(url);

const orderId = urlParams.get('orderId');
const productId = urlParams.get('productId');

let matchOrder;

orders.forEach((order)=>{
  if(order.id === orderId){
    matchOrder = order
  };
})


async function displayPage (matchOrder){
  await loadProductsFetch();
  let matchProduct;
  let finalProduct
  let currentTime =dayjs()//.add(4,'day');

  matchOrder.products.forEach((product)=>{ 
    if(product.productId === productId){
      matchProduct = product;
      products.forEach((productData)=>{
        if(matchProduct.productId === productData.id){
          finalProduct = productData;
        }
      })
    }
    })

  const deliveryTimeIn = dayjs(matchProduct.estimatedDeliveryTime)-dayjs(matchOrder.orderTime); 
  const orderedAgo = currentTime - dayjs(matchOrder.orderTime);
  const deliveryMessage = orderedAgo < deliveryTimeIn ? 'Arriving on' :'Delivered on';
  let progress = ((orderedAgo)/(deliveryTimeIn))*100;
  

  
  document.querySelector('.order-tracking').innerHTML =`
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>

    <div class="delivery-date">
      ${deliveryMessage} ${dayjs(matchOrder.orderTime).format('dddd, MMMM D')}
    </div>

    <div class="product-info">
      ${finalProduct.name}
    </div>

    <div class="product-info">
      Quantity: ${matchProduct.quantity}
    </div>

    <img class="product-image" src=${finalProduct.image}>

    <div class="progress-labels-container"
    >
      <div class="progress-label preparing">
        Preparing
      </div>
      <div class="progress-label shipped">
        Shipped
      </div>
      <div class="progress-label delivered ">
        Delivered
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width:${progress}%;"></div>
    </div>
  `;

  if(progress >=0 && progress<=49){
    document.querySelector('.preparing').classList.add('current-status')
    return
  };

  if(progress > 49 && progress <=99){
    document.querySelector('.shipped').classList.add('current-status')
    return
  };

  if(progress > 99){
    document.querySelector('.delivered').classList.add('current-status')
    return
  };


};

displayPage(matchOrder);
updateCart();
searchClicked();