import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema } from './entity/reservation.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'src/proto/user/user';
import { AuthService } from 'src/middleware/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
    ]), 
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50051',
          package: USER_PACKAGE_NAME,
          protoPath: '/home/admin185/Desktop/grpc_micro/restaurant-service/src/proto/user/user.proto',
        },
      },
    ])
    
  ],
  controllers: [ReservationController],
  providers: [ReservationService,AuthService],

})
export class ReservationModule {}
