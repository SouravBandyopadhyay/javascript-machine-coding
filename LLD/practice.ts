class CarP {
  private brand: string;
  private model: string;
  private speed: number;
  constructor(brand: string, model: string) {
    this.brand = brand;
    this.model = model;
    this.speed = 0;
  }
  accelerate(increment: number): void {
    this.speed += increment;
  }
  displayStatus(): void {
    console.log(`this ${this.brand} is running at ${this.speed}km/h`);
  }
}

function main(): void {
  const corolla = new CarP("Toyota", "corolla");
  corolla.accelerate(20);
  corolla.accelerate(10)
  
  console.log(corolla.displayStatus());
}
main();
