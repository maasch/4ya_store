export let orders = JSON.parse(localStorage.getItem('orders')) || [];

export function addOrder(order){
 orders.unshift(order);

 saveStorage()
}

function saveStorage(){
 localStorage.setItem('orders',JSON.stringify(orders))
};