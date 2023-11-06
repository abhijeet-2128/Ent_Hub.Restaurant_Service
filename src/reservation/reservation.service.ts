import { Injectable, Logger, OnModuleInit, Req } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation } from './entity/reservation.entity';
import { ReservationRequestDTO } from 'src/dto/restaurant.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
  ) {}

  async createReservation(reservationRequest: ReservationRequestDTO, userId:string): Promise<Reservation> {
    const { restaurantId, reservationTime, numberOfGuests } = reservationRequest;
    
    const createdReservation = await this.reservationModel.create({
      restaurantId,
      reservationTime,
      numberOfGuests,
      userId,
    });

    return createdReservation;
  }


  async checkAvailability(restaurantId: string, reservationTime: Date): Promise<boolean> {

    const existingReservations = await this.reservationModel
      .find({
        restaurantId,
        reservationTime,
        status: 'Booked',
      })
      .exec();

    const restaurantCapacity = 50;

    const isAvailable = existingReservations.length < restaurantCapacity;

    return isAvailable;
  }

  // private async validateUser(token: string): Promise<TokenValidationResponse> {
  //   const request: TokenValidationRequest = { token };
  //   return this.userServiceClient.validateToken(request).toPromise();
  // }

}