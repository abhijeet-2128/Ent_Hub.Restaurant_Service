import { Reservation } from "src/restaurant/entity/reservation.entity";

export class AvailabilityRequestDTO {
  restaurantId: string;
  reservationTime: Date;
}

export class AvailabilityResponseDTO {
  isAvailable: boolean;

  constructor(isAvailable: boolean) {
    this.isAvailable = isAvailable;
  }
}

export class ReservationRequestDTO {
  restaurantId: string;
  reservationTime: Date;
  numberOfGuests: number;
}

export class ReservationResponseDTO {
  reservation: Reservation;

  constructor(reservation: Reservation) {
    this.reservation = reservation;
  }
}
