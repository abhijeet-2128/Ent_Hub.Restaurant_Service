import { Module } from '@nestjs/common';
import { RestaurantModule } from './restaurant/restaurant.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationModule } from './reservation/reservation.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest_db'),
    RestaurantModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
