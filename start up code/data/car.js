class Car {
  #brand;
  #model;
  speed = 0;
  isTrunkOpen;
  constructor(carData){
    this.#brand = carData.brand;
    this.#model = carData.model;
  }
  
  displayInfo(){
    const trunkStatus = this.isTrunkOpen ? 'open' : 'closed';
    console.log(`${this.#brand}-${this.#model} , Speed: ${this.speed} Km/h, Trunk:${trunkStatus}`)
  }

  go(){

    if(!this.isTrunkOpen){
      this.speed+=5;
    }
    

    if(this.speed>200){
      this.speed = 200
    }
  }

  brake(){
    this.speed-=5;

    if(this.speed<0){
      this.speed = 0
    }
  }

  openTrunk(){
    if(this.speed === 0){
      this.isTrunkOpen = true;
    }
  }

  closeTrunk(){
    this.isTrunkOpen = false;
  }
}

const car1 = new Car(
  {
    brand:'Toyota',
    model:'Corolla'
  }
);

const car2 = new Car(
  {
    brand:'Tesla',
    model:'Model 3'
  }
)

class RaceCar extends Car{
 acceleration;

 constructor(carData){
  super(carData);
  this.acceleration = carData.acceleration;
 }


 displayInfo(){
  console.log(`${this.brand}-${this.model} , Speed: ${this.speed} Km/h`)
  }

 go(){
  this.speed += this.acceleration
  if(this.speed>300){
    this.speed=300
  }
 }

  openTrunk() {
  console.log('Race cars do not have a trunk.');
 }

  closeTrunk() {
  console.log('Race cars do not have a trunk.');
 }
}

const car3 = new RaceCar(
{
  brand: 'McLaren',
  model: 'F1',
  acceleration: 20
}
);

console.log(car1,car2,car3)

