import {cart} from '../../data/cart-class.js';
import {products, getProduct} from '../../data/products.js';
import {moneyCurrn} from '../unit/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {deliveryOptions, getDeliveryOption} from '../../data/deliveryoptions.js';
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderCheckoutSummary(){
  let cartSummary='';
  cart.cartItems.forEach((cartItem)=>{
    const matchProduct = getProduct(cartItem)

    const deliveryOptionId = cartItem.deliveryOptionId;

    const optionSelected =getDeliveryOption(deliveryOptionId);
    


    cartSummary+=`
      <div class="cart-item-container js-cart-item-container js-cart-item-container-${matchProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dayjs().add(optionSelected.deliveryDays,'days').format('dddd, MMMM D ')}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src=${matchProduct.image}>

          <div class="cart-item-details">
            <div class="product-name product-name-${matchProduct.id}">
              ${matchProduct.name}
            </div>
            <div class="product-price product-price-${matchProduct.id}">
              ${matchProduct.getPrice()}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span  class="quantity-label quantity-label-${matchProduct.id}">${cartItem.quantity}</span>
              </span>
              <span data-product-id="${matchProduct.id}" class="update-quantity-link link-primary js-update-quantity">
                Update
              </span>
              <input class="quantity-input" type="text">
              <span data-product-id="${matchProduct.id}" class="save-quantity link-primary">Save</span>
              <span data-product-id="${matchProduct.id}" class="delete-quantity-link link-primary js-delete-quantity 
              js-delete-link-${matchProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchProduct,cartItem)}
          </div>
        </div>
      </div>
      `
  });

  function deliveryOptionsHTML(matchProduct,cartItem){
    let html='';
    deliveryOptions.forEach((deliveryOption)=>{
      const today=dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays ,'days');
      const stringDate = deliveryDate.format('dddd, MMMM D');
      const price = deliveryOption.priceCents===0 ? 'FREE ' : `$${moneyCurrn(deliveryOption.priceCents)} -`;
      
      const matchId = cartItem.deliveryOptionId===deliveryOption.id ? 'checked' :'';
      

    html+= `
      <div class="delivery-option checked-js
           js-update-delivery-${matchProduct.id}-${deliveryOption.id}"
          data-product-id="${matchProduct.id}"
          data-delivery-id="${deliveryOption.id}"
          >
        <input type="radio" ${matchId}
          class="delivery-option-input 
          update-delivery-input-${matchProduct.id}-${deliveryOption.id}"
          name="delivery-option-${matchProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${stringDate}
          </div>
          <div class="delivery-option-price">
            ${price} Shipping
          </div>
        </div>
      </div> 
      `
    });
    return html;
  };

  document.querySelector('.js-order-summary').innerHTML=cartSummary;

  // Add event listeners after the HTML is rendered
  document.querySelectorAll('.checked-js')
  .forEach((element)=>{
    element.addEventListener('click',()=>{
      const productId = element.dataset.productId;
      const deliveryOptionId = element.dataset.deliveryId;
      cart.updateCartDeliveryOptionId(productId,deliveryOptionId);
      renderCheckoutSummary();
      renderPaymentSummary()
    })
  })

  document.querySelectorAll('.js-delete-quantity')
  .forEach((span)=>{
    span.addEventListener('click',()=>{
    const {productId} =span.dataset;
    cart.removeCartItem(productId);
    document.querySelector(`.js-cart-item-container-${productId}`).remove();
    renderPaymentSummary()
    })
  });
  cart.updateItemQuantity();

  document.querySelectorAll('.js-update-quantity')
  .forEach((span)=>{
    span.addEventListener('click',()=>{
      const {productId}=span.dataset;
      document.querySelector(`.js-cart-item-container-${productId}`)
      .classList.add('isEditig-quantity');
    })
  });

  document.querySelectorAll('.save-quantity')
  .forEach((span)=>{
    span.addEventListener('click', ()=>{
      const {productId}=span.dataset;
      document.querySelector(`.js-cart-item-container-${productId}`)
      .classList.remove('isEditig-quantity');
      cart.updateNewQuantity(productId);
      renderPaymentSummary()
    })
  });

  document.body.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const activeContainer = document.querySelector('.isEditig-quantity');
      if (activeContainer) {
        const productId = activeContainer.querySelector('.js-update-quantity').dataset.productId;
        activeContainer.classList.remove('isEditig-quantity');
        cart.updateNewQuantity(productId);
      }
    }
  });
};
