import { doesExist } from "./deliveryoptions.js";

export let cart;
loadFromStorage()
export function loadFromStorage(){
  cart = JSON.parse(localStorage.getItem('cart'))
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
};

function saveStorage(){
  localStorage.setItem('cart',JSON.stringify(cart))
}
export function addToCart(productId){
  const quantity = Number(document.querySelector(`.js-quantity-selected-${productId}`).value);

  let isMatching;

  cart.forEach((cartItem)=>{
    if(cartItem.productId===productId){
      isMatching=cartItem;
    }  
  }) 

  if(isMatching){
    isMatching.quantity+=quantity
  } else{
    cart.push({
      productId,
      quantity,
      deliveryOptionId: '1'
    }); 
  };
  saveStorage();
};


export function removeCartItem(productId){
  let newCart=[];
  cart.forEach((cartItem)=>{
    if(cartItem.productId!==productId){
      newCart.push(cartItem);
    }
  })
  cart=newCart;
  saveStorage();
  updateItemQuantity()
}

export function updateItemQuantity(){
  let ItemsQuantity=0;
  
  cart.forEach((cartItem)=>{
    ItemsQuantity+=cartItem.quantity;
  });
  
  document.querySelector('.items-quantity')
    .innerHTML =` ${ItemsQuantity} Items`;
};

export function updateNewQuantity(productId){

    const quantityEdited = document.querySelector(`.quantity-input`)
     .value;
    const newQuantity = Number(quantityEdited);
    
    cart.forEach((cartItem)=>{
      if(cartItem.productId===productId){
       cartItem.quantity=newQuantity;
      }  
    });

    document.querySelector(`.quantity-label-${productId}`)
     .innerHTML = newQuantity;
    
    updateItemQuantity();
    saveStorage()
};


export function updateCartDeliveryOptionId(productId,deliveryOptionId){
  let matchProduct;
  cart.forEach((cartItem)=>{
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
  saveStorage();
}