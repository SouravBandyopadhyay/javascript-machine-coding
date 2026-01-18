/* SECTION: Parking Lot Management System

REQUIREMENTS:
1. Multiple floors in the parking lot
2. Each floor has multiple parking spots
3. Spot types: Bike, Car, Truck
4. Vehicles can park and leave the lot
5. System automatically assigns an appropriate spot based on vehicle type
6. Calculate parking fee (basic rate per vehicle type and duration)

CORE FUNCTIONALITY:
- ParkingLot: Main system managing floors
- Floor: Container for parking spots
- ParkingSpot: Individual parking space with type and availability
- Vehicle: Base class for different vehicle types (Bike, Car, Truck)
- ParkingTicket: Issued when vehicle parks, used to calculate fee on exit
*/

enum VehicleType {
  CAR = "CAR",
  TRUCK = "TRUCK",
  BIKE = "BIKE",
}

// ABSTRACTION
abstract class Vehicle {
  constructor(
    public readonly vehicleNumber: string,
    public readonly type: VehicleType
  ) {}
}

// INHERITENCE
class Bike extends Vehicle {
  constructor(vehicleNumber: string) {
    super(vehicleNumber, VehicleType.BIKE);
  }
}

class Car extends Vehicle {
  constructor(vehicleNumber: string) {
    super(vehicleNumber, VehicleType.CAR);
  }
}

class Truck extends Vehicle {
  constructor(vehicleNumber: string) {
    super(vehicleNumber, VehicleType.TRUCK);
  }
}

// Parking Spot
class ParkingSpot {
  private parkedVehicle: Vehicle | null = null;
  constructor(
    public readonly spotId: string,
    public readonly type: VehicleType
  ) {}
  isfree(): boolean {
    return this.parkedVehicle === null;
  }
  canfitVehicle(vehicle: Vehicle): boolean {
    return this.isfree() && this.type === vehicle.type;
  }
  park(vehicle: Vehicle): void {
    if (!this.canfitVehicle(vehicle)) {
      throw new Error(`This spot cannot fit vehicle`);
    }
    this.parkedVehicle = vehicle;
  }
  removeVehicle(): void {
    this.parkedVehicle = null;
  }
}

class ParkingFloor {
  constructor(
    public readonly floorNumber: number,
    private spots: ParkingSpot[]
  ) {}
  findAvailableSpot(vehicle: Vehicle): ParkingSpot | null {
    for (const spot of this.spots) {
      if (spot.canfitVehicle(vehicle)) {
        return spot;
      }
    }
    return null;
  }
}

class Ticket {
  public readonly entryTime: Date;
  constructor(
    public readonly ticketId: string,
    public readonly vehicle: Vehicle,
    public readonly spot: ParkingSpot
  ) {
    this.entryTime = new Date();
  }
}

class ParkingLot {
  constructor(private floors: ParkingFloor[]) {}
  parkVehicle(vehicle: Vehicle): Ticket {
    for (const floor of this.floors) {
      const spot = floor.findAvailableSpot(vehicle);
      if (spot) {
        spot.park(vehicle);
        const ticketId = Math.random().toString(36).substring(2);
        return new Ticket(ticketId, vehicle, spot);
      }
    }
    throw new Error("No parking spot Found");
  }

  unparkVehicle(ticket: Ticket): void {
    ticket.spot.removeVehicle();
  }
}

// create parking spots
const spotsFloor1 = [
  new ParkingSpot("F1-S1", VehicleType.CAR),
  new ParkingSpot("F1-S2", VehicleType.BIKE),
];

// create floor
const floor1 = new ParkingFloor(1, spotsFloor1);

// create parking lot
const parkingLot = new ParkingLot([floor1]);

// create vehicles
const car = new Car("KA-01-1234");
const bike = new Bike("KA-02-5678");

// park vehicles
const carTicket = parkingLot.parkVehicle(car);
console.log("Car parked with ticket:", carTicket.ticketId);

const bikeTicket = parkingLot.parkVehicle(bike);
console.log("Bike parked with ticket:", bikeTicket.ticketId);

// unpark car
parkingLot.unparkVehicle(carTicket);
console.log("Car unparked");
