/***********************************************************************
 * SECTION: Parking Lot Management System (LLD Practice)
 *
 * HOW TO USE THIS FILE:
 * - Read comments aloud while coding
 * - Each section explains "WHY", not just "WHAT"
 * - Designed for whiteboard / interview coding
 *
 * CORE REQUIREMENTS:
 * 1. Multiple floors
 * 2. Each floor has multiple parking spots
 * 3. Spot types support Bike, Car, Truck
 * 4. Vehicles can park and leave
 * 5. System auto-assigns appropriate spot
 * 6. Pricing can be added later (extensible design)
 ***********************************************************************/

/***********************************************************************
 * STEP 1: ENUMS (Domain Constants)
 *
 * SPEAK:
 * "I start by modeling fixed domain values using enums.
 *  This prevents invalid states and magic strings."
 ***********************************************************************/

enum VehicleType {
  CAR = "CAR",
  BIKE = "BIKE",
  TRUCK = "TRUCK",
}

enum SpotType {
  BIKE = "BIKE",
  COMPACT = "COMPACT",
  LARGE = "LARGE",
}

/***********************************************************************
 * STEP 2: VEHICLE (Abstraction)
 *
 * SPEAK:
 * "Vehicle is a concept, not a concrete object.
 *  I make it abstract so no one can create a generic vehicle."
 ***********************************************************************/

abstract class Vehicle {
  constructor(
    public readonly vehicleNumber: string, // immutable identity
    public readonly type: VehicleType       // fixed vehicle type
  ) {}
}

/***********************************************************************
 * STEP 3: CONCRETE VEHICLES (Inheritance)
 *
 * SPEAK:
 * "Car, Bike, and Truck are specific types of Vehicle.
 *  They reuse the base abstraction."
 ***********************************************************************/

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

/***********************************************************************
 * STEP 4: PARKING SPOT (Encapsulation)
 *
 * SPEAK:
 * "ParkingSpot owns the most important invariant:
 *  whether a vehicle is parked or not.
 *  I strongly encapsulate this state."
 ***********************************************************************/

class ParkingSpot {
  // Private ensures no external class can mutate state directly
  private parkedVehicle: Vehicle | null = null;

  constructor(
    public readonly spotId: string, // unique identifier
    public readonly type: SpotType  // spot size/type
  ) {}

  // Check if the spot is currently free
  isFree(): boolean {
    return this.parkedVehicle === null;
  }

  // Business rule: check if vehicle can fit in this spot
  canFitVehicle(vehicle: Vehicle): boolean {
    if (!this.isFree()) return false;

    switch (vehicle.type) {
      case VehicleType.BIKE:
        return this.type === SpotType.BIKE || this.type === SpotType.COMPACT;

      case VehicleType.CAR:
        return this.type === SpotType.COMPACT || this.type === SpotType.LARGE;

      case VehicleType.TRUCK:
        return this.type === SpotType.LARGE;

      default:
        return false;
    }
  }

  // Park vehicle after validating rules
  parkVehicle(vehicle: Vehicle): void {
    if (!this.canFitVehicle(vehicle)) {
      throw new Error("Vehicle cannot fit in the parking spot");
    }
    this.parkedVehicle = vehicle;
  }

  // Free the spot
  removeVehicle(): void {
    this.parkedVehicle = null;
  }
}

/***********************************************************************
 * STEP 5: PARKING FLOOR (Composition)
 *
 * SPEAK:
 * "A parking floor groups parking spots.
 *  It helps find a spot but does not park vehicles itself."
 ***********************************************************************/

class ParkingFloor {
  constructor(
    private readonly floorNumber: number,
    public readonly spots: ParkingSpot[]
  ) {}

  // Find first available compatible spot
  findAvailableSpot(vehicle: Vehicle): ParkingSpot | null {
    for (const spot of this.spots) {
      if (spot.canFitVehicle(vehicle)) {
        return spot;
      }
    }
    return null;
  }
}

/***********************************************************************
 * STEP 6: TICKET (Single Responsibility Principle)
 *
 * SPEAK:
 * "Ticket is a data holder.
 *  It stores parking metadata, not business logic."
 ***********************************************************************/

class Ticket {
  public readonly entryTime: Date;

  constructor(
    public readonly vehicle: Vehicle,
    public readonly spot: ParkingSpot,
    public readonly ticketId: string
  ) {
    this.entryTime = new Date(); // captured at creation
  }
}

/***********************************************************************
 * STEP 7: PARKING LOT (Orchestrator)
 *
 * SPEAK:
 * "ParkingLot is the entry point.
 *  It orchestrates the flow and delegates responsibilities."
 ***********************************************************************/

class ParkingLot {
  constructor(private readonly floors: ParkingFloor[]) {}

  // Park vehicle and issue ticket
  parkVehicle(vehicle: Vehicle): Ticket {
    for (const floor of this.floors) {
      const spot = floor.findAvailableSpot(vehicle);

      if (spot) {
        spot.parkVehicle(vehicle);

        // Simple ticket generation
        const ticketId = Math.random().toString(36).substring(2);

        return new Ticket(vehicle, spot, ticketId);
      }
    }

    throw new Error("No available parking spot for this vehicle type");
  }

  // Unpark vehicle using ticket
  unparkVehicle(ticket: Ticket): void {
    ticket.spot.removeVehicle();
  }
}



// SECTION : Console for Logging out
// 1️⃣ Create parking spots
const floor1Spots: ParkingSpot[] = [
  new ParkingSpot("F1-B1", SpotType.BIKE),
  new ParkingSpot("F1-C1", SpotType.COMPACT),
  new ParkingSpot("F1-L1", SpotType.LARGE),
];

const floor2Spots: ParkingSpot[] = [
  new ParkingSpot("F2-C1", SpotType.COMPACT),
  new ParkingSpot("F2-L1", SpotType.LARGE),
];

// 2️⃣ Create parking floors
const floor1 = new ParkingFloor(1, floor1Spots);
const floor2 = new ParkingFloor(2, floor2Spots);

// 3️⃣ Create parking lot with multiple floors
const parkingLot = new ParkingLot([floor1, floor2]);

// 4️⃣ Create vehicles
const bike = new Bike("KA-01-BIKE-1234");
const car = new Car("KA-01-CAR-5678");
const truck = new Truck("KA-01-TRUCK-9999");

// 5️⃣ Park vehicles
console.log("---- Parking Vehicles ----");

const bikeTicket = parkingLot.parkVehicle(bike);
console.log(
  `Bike parked | Ticket: ${bikeTicket.ticketId} | Spot: ${bikeTicket.spot.spotId}`
);

const carTicket = parkingLot.parkVehicle(car);
console.log(
  `Car parked | Ticket: ${carTicket.ticketId} | Spot: ${carTicket.spot.spotId}`
);

const truckTicket = parkingLot.parkVehicle(truck);
console.log(
  `Truck parked | Ticket: ${truckTicket.ticketId} | Spot: ${truckTicket.spot.spotId}`
);

// 6️⃣ Unpark a vehicle
console.log("---- Unparking Vehicle ----");

parkingLot.unparkVehicle(carTicket);
console.log(`Car with ticket ${carTicket.ticketId} has exited`);