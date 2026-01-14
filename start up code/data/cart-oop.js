import { doesExist } from "./deliveryoptions.js";

function Cart(localStorageKey){

  const cart = {
    cartItems:undefined,
    
    loadFromStorage(){
      this.cartItems = JSON.parse(localStorage.getItem(localStorageKey))
      || [{
          productId:'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
          quantity:1,
          deliveryOptionId:'1'
        },
        {
          productId:'15b6fc6f-327a-4ec4-896f-486349e85a3d',
          quantity:2,
          deliveryOptionId:'3'
        }];
    },

    saveStorage(){
    localStorage.setItem(localStorageKey,JSON.stringify(cart))
    },

    addToCart(productId){
      

      let isMatching;

      this.cartItems.forEach((cartItem)=>{
        if(cartItem.productId===productId){
            isMatching=cartItem;
          }  
        }) 

        if(isMatching){
          isMatching.quantity+=1
        } else{
          this.cartItems.push({
            productId,
            quantity:1,
            deliveryOptionId: '1'
          }); 
        };
      this.saveStorage();
    },

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
    },

    updateItemQuantity(){
      let ItemsQuantity=0;
      
      this.cartItems.forEach((cartItem)=>{
        ItemsQuantity+=cartItem.quantity;
      });
      
      document.querySelector('.items-quantity')
        .innerHTML =` ${ItemsQuantity} Items`;
    },


    updateNewQuantity(productId){

      const quantityEdited = document.querySelector(`.quantity-input`)
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
    },

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
  };
  return cart;
}

const cart = Cart('cart-oop');

const businessCart = Cart('bus-cart');


cart.loadFromStorage()
businessCart.loadFromStorage()


console.log(cart)
console.log(businessCart)
