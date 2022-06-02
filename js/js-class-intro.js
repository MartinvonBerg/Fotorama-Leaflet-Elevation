// source: https://www.sitepoint.com/javascript-private-class-fields/

class Animal {

    constructor(name = 'anonymous', legs = 4, noise = 'nothing') {
  
      this.type = 'animal';
      this.name = name;
      this.legs = legs;
      this.noise = noise;
  
    }
  
    speak() {
      console.log(`${this.name} says "${this.noise}"`);
    }
  
    walk() {
      console.log(`${this.name} walks on ${this.legs} legs`);
    }
  
    // setter
    set eats(food) {
      this.food = food;
    }
  
    // getter
    get dinner() {
      return `${this.name} eats ${this.food || 'nothing'} for dinner.`;
    }
  
}

class Human extends Animal {
    static count = 0; // counts the number of instances of this class.
    a = 1;
    #b = 2;

    constructor(name) {
  
      // call the Animal constructor
      super(name, 2, 'nothing of interest');
      this.type = 'human';
      // update count of Human objects
      Human.count++;  
    }
  
    // override Animal.speak
    speak(to) {
  
      super.speak();
      if (to) console.log(`to ${to}`);
  
    }

    // return number of instances of this class.
    static get COUNT() {
        return Human.count;
    }
  
}

let rex = new Animal('Rex', 4, 'woof');
rex.speak();          // Rex says "woof"
rex.noise = 'growl';
rex.speak();          // Rex says "growl"
rex.eats = 'anything';
console.log( rex.dinner );  // Rex eats anything for dinner.

let don = new Human('Don');
don.speak('anyone');        // Don says "nothing of interest" to anyone

don.eats = 'burgers';
console.log( don.dinner );  // Don eats burgers for dinner.

console.log(`Humans defined: ${Human.COUNT}`); // Humans defined: 1

let kim = new Human('Kim');

console.log(`Humans defined: ${Human.COUNT}`); // Humans defined: 2