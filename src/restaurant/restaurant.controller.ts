import { Restaurant } from './restaurant.schemal';
import { RestaurantService } from './restaurant.service';
import { Controller, Get, Param, Body, Put, Query } from '@nestjs/common';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async getRestaurants() {
    return this.restaurantService.getRestaurants();
  }

  @Get()
  async getNearbyRestaurants(@Query() location:{latitude:number, longitude:number}){
    const nearbyRestaurants = await this.restaurantService.getNearbyRestaurants(location);
    return nearbyRestaurants;
  }

  @Get(':restaurantId')
  async getRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getRestaurant(restaurantId);
  }

  @Put(':restaurantId')
  async updateRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() updatedRestaurant: Restaurant,
  ) {
    return this.restaurantService.updateRestaurant(restaurantId, updatedRestaurant);
  }
}
