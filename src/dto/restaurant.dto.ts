export class AvailabilityRequestDTO {
    restaurantId: string;
    reservationTime: Date;
  }
  
  export class AvailabilityResponseDTO {
    isAvailable: boolean;
  }
  
  export class ReservationRequestDTO {
    restaurantId: string;
    reservationTime: Date;
    numberOfGuests: number;
  }
  
  export class ReservationResponseDTO {
    reservation: Reservation;
  }
  
  // Reservation Model
  export interface Reservation {
    id: string;
    restaurantId: string;
    userId: string;
    reservationTime: Date;
    numberOfGuests: number;
    // Add other fields as needed
  }