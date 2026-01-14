import { cart } from "../../data/cart-class.js";
export function moneyCurrn(priceCents){
  return (Math.round(priceCents)/100).toFixed(2);
};
export function updateCart(){
    let cartQuantity=0;

    cart.cartItems.forEach((cartItem)=>{
      cartQuantity+=cartItem.quantity;
    });

    document.querySelector('.js-cart-quantity')
      .innerHTML = cartQuantity;}
