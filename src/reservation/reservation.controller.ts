import { Controller, Post, Body, Param, Get, UseGuards, UnauthorizedException, OnModuleInit, Req } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ClientProxy} from '@nestjs/microservices';
import { createReservation } from './reservation.dto';
import { JwtAuthGuard } from 'src/middleware/jwt.guard';
import { ReservationRequestDTO } from 'src/dto/restaurant.dto';


@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createReservation(@Body() reservationRequest: ReservationRequestDTO,@Req() req) {
     const userId = req.user;
     const reservation = await this.reservationService.createReservation(reservationRequest, userId);
     return {reservation}
     
  }

  @Get('availability/:restaurantId/:reservationTime')
  async checkAvailability(
    @Param('restaurantId') restaurantId: string,
    @Param('reservationTime') reservationTime: string,
  ) {
    const isAvailable = await this.reservationService.checkAvailability(
      restaurantId,
      new Date(reservationTime),
    );
    return { isAvailable };
  }
}