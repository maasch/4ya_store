import { renderCheckoutSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { loadProductsArry, loadProductsFetch} from "../data/products.js";
import {loadCart, loadCartFetch} from '../data/cart-class.js';

await Promise.all([
  loadProductsFetch(),
  loadCartFetch()
]).then(()=>{
  renderCheckoutSummary();
  renderPaymentSummary();
})
/*
async function loadPage(){
  try{
    //throw 'error1'
   await loadProductsFetch();

   await loadCartFetch() ;//new Promise((resolve, reject)=>{
    //throw 'error2';
    //loadCart(()=>{
      //reject()
     // resolve()
    //})
  //});
  } catch{
    console.log('Unexpected error , Please try again later');
  }
 

  renderCheckoutSummary();
  renderPaymentSummary();
}
loadPage()
*/


/*
Promise.all([
  loadProductsFetch(),
  new Promise((resolve)=>{
    loadCart(()=>{
      resolve()
    })
  })
]).then((values)=>{
  console.log(values)
  renderCheckoutSummary();
  renderPaymentSummary();
})
*/

/*
new Promise((resolve)=>{
  loadProductsArry(()=>{
    resolve()
  })
}).then(()=>{
  return new Promise((resolve)=>{
    loadCart(()=>{
      resolve()
    })
  })
}).then(()=>{
  renderCheckoutSummary();
  renderPaymentSummary();
})

*/


/*
loadProductsArry(()=>{
  loadCart(()=>{
    renderCheckoutSummary();
    renderPaymentSummary();
  })
})
*/

//import '../data/cart-class.js';
//import '../data/car.js';
//import '../data/practice-backend.js';