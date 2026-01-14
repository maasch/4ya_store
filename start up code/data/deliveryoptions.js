 export const deliveryOptions=[
  {
  id:'1',
  deliveryDays:7,
  priceCents:0
},{
  id:'2',
  deliveryDays:3,
  priceCents:499
},{
  id:'3',
  deliveryDays:1,
  priceCents:999
}];

export function getDeliveryOption(deliveryOptionId){
  let optionSelected;
  deliveryOptions.forEach((option)=>{
      if(deliveryOptionId===option.id){
        optionSelected=option
      }
    })
  return optionSelected ||optionSelected[0];
};

export function doesExist(deliveryOptionId){
  let exist = false;
  deliveryOptions.forEach((option)=>{
    if(deliveryOptionId===option.id){
        exist= true;
      }
  })
  return exist;
}