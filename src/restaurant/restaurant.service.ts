import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant } from './restaurant.schemal';


@Injectable()
export class RestaurantService {
  constructor(@InjectModel('Restaurant') private readonly restaurantModel: Model<Restaurant>) {}

  async getRestaurants() {
    return this.restaurantModel.find().exec();
  }

  async getNearbyRestaurants(location: { latitude: number, longitude: number }) {
    const nearbyRestaurants = await this.restaurantModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [-73.983456, 40.580678],
          },
          distanceField: 'distance',
          maxDistance: 100,
          spherical: true,
        },
      },
    ]);

    return nearbyRestaurants;
  }


  async getRestaurant(restaurantId: string) {
    return this.restaurantModel.findById(restaurantId).exec();
  }

  async updateRestaurant(restaurantId: string, updatedRestaurant) {
    return this.restaurantModel.findByIdAndUpdate(restaurantId, updatedRestaurant, { new: true }).exec();
  }
}