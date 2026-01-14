import { doesExist } from "./deliveryoptions.js";

class Cart{
  cartItems;
  #localStorageKey;

  constructor(localStorageKey){
    this.#localStorageKey = localStorageKey;
    this.loadFromStorage();
  }
  loadFromStorage(){
    this.cartItems = JSON.parse(localStorage.getItem(this.#localStorageKey))
    || [{
        productId:'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
        quantity:1,
        deliveryOptionId:'1'
      },
      {
        productId:'15b6fc6f-327a-4ec4-896f-486349e85a3d',
        quantity:2,
        deliveryOptionId: '3'
      }];
  }


  saveStorage(){
    localStorage.setItem(this.#localStorageKey,JSON.stringify(this.cartItems))
  }


  addToCart(productId){
    const quantity = Number(document.querySelector(`.js-quantity-selected-${productId}`).value);
    let isMatching;

    this.cartItems.forEach((cartItem)=>{
      if(cartItem.productId===productId){
          isMatching=cartItem;
        }  
      }) 

      if(isMatching){
        isMatching.quantity+=quantity
      } else{
        this.cartItems.push({
          productId,
          quantity,
          deliveryOptionId: '1'
        }); 
      };
    this.saveStorage();
  }

  addToCarrt(productId){
    let isMatching;

    this.cartItems.forEach((cartItem)=>{
      if(cartItem.productId===productId){
          isMatching=cartItem;
        }  
      }) 

      if(isMatching){
        isMatching.quantity+=1;
      } else{
        this.cartItems.push({
          productId,
          quantity:1,
          deliveryOptionId: '1'
        }); 
      };
    this.saveStorage();
  }


  removeCartItem(productId){
      let newCart=[];
      this.cartItems.forEach((cartItem)=>{
        if(cartItem.productId!==productId){
          newCart.push(cartItem);
        }
      })
      this.cartItems=newCart;
      this.saveStorage();
      this.updateItemQuantity()
  }


  updateItemQuantity(){
      let ItemsQuantity=0;
      
      this.cartItems.forEach((cartItem)=>{
        ItemsQuantity+=cartItem.quantity;
      });
      
      document.querySelector('.items-quantity')
        .innerHTML =` ${ItemsQuantity} Items`;
  }


   updateNewQuantity(productId){

      const quantityEdited = document.querySelector(`.js-cart-item-container-${productId} .quantity-input`)
      .value;
      const newQuantity = Number(quantityEdited);
      
      this.cartItems.forEach((cartItem)=>{
        if(cartItem.productId===productId){
        cartItem.quantity=newQuantity;
        }  
      });

      document.querySelector(`.quantity-label-${productId}`)
      .innerHTML = newQuantity;
      
      this.updateItemQuantity();
      this.saveStorage()
  }

   updateCartDeliveryOptionId(productId,deliveryOptionId){
      let matchProduct;
      this.cartItems.forEach((cartItem)=>{
        if(cartItem.productId===productId){
          matchProduct=cartItem
        };
      })

      if(!matchProduct){
        return
      };

      if(!doesExist(deliveryOptionId)){
        return
      };
      matchProduct.deliveryOptionId=deliveryOptionId;
      this.saveStorage();
  }

  resetCart(){
    this.cartItems=[];
    this.saveStorage()
  }
}

export const cart = new Cart('cart');


export async function loadCartFetch(){
 return await fetch('https://supersimplebackend.dev/cart')
 .then(response => response.text())
 .then((text)=>{
  console.log(text)
 })
}
export function loadCart(fun){
  const xhr = new XMLHttpRequest();
  xhr.addEventListener('load', ()=>{
    console.log(xhr.response);
     if (typeof fun === 'function') {
      fun();
    }
  })
  xhr.open('GET' , 'https://supersimplebackend.dev/cart')
  xhr.send()
}
