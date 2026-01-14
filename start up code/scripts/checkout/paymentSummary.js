import {getProduct} from '../../data/products.js';
import {cart} from '../../data/cart-class.js';
import {getDeliveryOption} from '../../data/deliveryoptions.js';
import { moneyCurrn } from '../unit/money.js';
import { orders,  addOrder } from '../../data/orders.js';

export function renderPaymentSummary(){
  let productsPriceCents = 0;
  let shippingPriceCents = 0;
  let totalBeforeTax = 0;
  let tax = 0;
  let orderTotal = 0;
  cart.cartItems.forEach((cartItem)=>{
   const matchProduct = getProduct(cartItem);
   productsPriceCents += matchProduct.priceCents*cartItem.quantity;
   const option = getDeliveryOption(cartItem.deliveryOptionId);
   shippingPriceCents+=option.priceCents;
   totalBeforeTax = productsPriceCents + shippingPriceCents;
   tax = totalBeforeTax * 0.1;
   orderTotal = totalBeforeTax + tax;
  });

  
  function items(){
    let ItemsQuantity=0;
  
    cart.cartItems.forEach((cartItem)=>{
      ItemsQuantity+=cartItem.quantity;
    });
    return ItemsQuantity;
  }

  const paymentSummaryHTML=`
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${items()}):</div>
      <div class="payment-summary-money">
       $${moneyCurrn(productsPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money
      js-update-delivery">
       $${moneyCurrn(shippingPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money
      js-total">
       $${moneyCurrn(totalBeforeTax)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">
       $${moneyCurrn(tax)}
      </div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">
       $${moneyCurrn(orderTotal)}
      </div>
    </div>

    <button class="place-order-button button-primary js-place-order">
      Place your order
    </button>
  `
  document.querySelector('.payment-summary')
   .innerHTML = paymentSummaryHTML;
  
  document.querySelector('.js-place-order')
   .addEventListener('click', async ()=>{

    try{
     const response = await fetch('https://supersimplebackend.dev/orders',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          cart:cart.cartItems
        })
      })


      const order = await response.json()
      
      addOrder(order);
      cart.resetCart()
      window.location.href = 'orders.html'
      
    } catch{
     console.log('Something went wrong , Try again later')
    }
   })
}