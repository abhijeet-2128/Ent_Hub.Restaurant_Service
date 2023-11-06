import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantSchema } from './restaurant.schemal';

@Module({
  imports: [
  // MongooseModule.forRoot('mongodb+srv://abhijeetsrivastava:abhijeet2128@cluster0.6mk5ny2.mongodb.net/sample_restaurants'),
  MongooseModule.forFeature([
    {name:'Restaurant',schema: RestaurantSchema}
  ])
],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
