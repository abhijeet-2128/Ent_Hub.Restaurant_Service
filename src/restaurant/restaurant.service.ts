import { Injectable } from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation } from './entity/reservation.entity';
import { UserInfoResponse } from 'src/proto/user/user';
import { AuthService } from 'src/middleware/jwt.service';
import { ReservationRequestDTO } from './dto/restaurant.dto';
import { MenuItem, Restaurant } from './entity/restaurant.schemal';
import { Order } from './entity/order.entity';
import { ProucerService } from 'src/kafka/producet.service';
// import { ObjectId } from 'mongodb';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectModel(Restaurant.name) private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly service: AuthService,
    private readonly producerService: ProucerService
  ) { }

  async createReservation(reservationRequest: ReservationRequestDTO, userId: string): Promise<Reservation> {
    const { restaurantId, reservationTime, numberOfGuests } = reservationRequest;
    const isValidRestaurant = await this.validateRestaurant(restaurantId);

    if (!isValidRestaurant) {
      throw new Error('Invalid restaurantId');

    }
    const createdReservation = await this.reservationModel.create({
      restaurantId,
      reservationTime,
      numberOfGuests,
      userId,
    });
    return createdReservation;

  }

  async validateRestaurant(restaurantId: string): Promise<boolean> {
    try {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(restaurantId);

      if (!isValidObjectId) {
        return false;
      }
      const restaurant = await this.restaurantModel.findById(restaurantId);
      return !!restaurant;
    } catch (error) {
      return false;
    }
  }

  async checkAvailability(restaurantId: string, reservationTime: Date, numberOfGuests: number): Promise<boolean> {

    console.log("checking availablity");

    const currentTime = new Date();
    console.log(reservationTime);

    console.log(currentTime);

    if (reservationTime <= currentTime) {
      console.log('Invalid reservation time ! Please choose a future date');
      return false;
    }

    const existingReservations = await this.reservationModel.find({
      restaurantId,
      reservationTime,
      status: 'Booked',
    });

    console.log(existingReservations);

    const restaurant = await this.restaurantModel.findById(restaurantId);

    //checking if the number of guests is within the restaurant's capacity
    const totalReservedSeats = existingReservations.reduce((total, reservation) => total + reservation.numberOfGuests, 0);
    const availableCapacity = restaurant.restaurantCapacity - totalReservedSeats;

    if (numberOfGuests <= availableCapacity) {
      return true;
    } else {
      console.log(`Only ${availableCapacity} seats available for the specified time.`);
      return false;
    }
  }


  async getUserReservationInfo(userId: string) {
    const { name, email }: UserInfoResponse = await this.service.getUser(userId);
    return { name, email }
  }

  async getRestaurants() {
    const restaurants = await this.restaurantModel.aggregate([
      {
        $project: {
          name: 1,
          address: 1,
          restaurantCapacity: 1,
          cuisine_type: 1,
          menu_items: 1,
          average_rating: 1,
          location: {
            type: 1,
            coordinates: 1,
          },
        },
      },
    ]);
    return restaurants;
  }

  async getNearbyRestaurants(location: any) {
    const maxDistance = 1000;
    const nearbyRestaurants = await this.restaurantModel.aggregate([
      {
        $geoNear: {
          near: location,
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
          key: "location",
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

  async placeFoodDeliveryOrder(restaurantId: string, orderRequest: any, userId: string) {
    try {
      const { items, deliveryAddress, contactNumber } = orderRequest;
      const restaurant = await this.restaurantModel.findById(restaurantId);

      if (!restaurant) {
        return { message: 'Restaurant not found.' };
      }
      //validate items
      const validItems = items.every((item) => this.isValidMenuItem(item, restaurant.menu_items));
      if (!validItems) {
        return { message: 'Invalid menu items in the order.' };
      }
      const orderResult = await this.processFoodDeliveryOrder(
        restaurant,
        items,
        deliveryAddress,
        contactNumber,
        userId,
      );

      return orderResult;
    } catch (error) {
      // Handle any unexpected errors
      console.error(error);
      return { message: 'Internal Server Error' };
    }
  }

  private isValidMenuItem(item: any, menuItems: any[]): boolean {
    return menuItems.some((menuItem) => menuItem.name === item.name);
  }

  private async processFoodDeliveryOrder(
    restaurant: any,
    items: any[],
    deliveryAddress: string,
    contactNumber: string,
    userId: string,
  ) {
    try {
      const orderTotal = items.reduce((total, item) => {
        const menuItem = restaurant.menu_items.find(menuItem => menuItem.name === item.name);
        return total + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);
      const order = new this.orderModel({
        userId,
        restaurantId: restaurant._id,
        items,
        deliveryAddress,
        contactNumber,
        orderType: 'food_delivery',
        orderTotal
      });

      const savedOrder = await order.save();
      await this.producerService.produce({
        topic: 'orderPlaced',
        messages: [{
          value: `order placed successfully. ProductId: ${savedOrder._id} and total price: ${savedOrder.orderTotal}`
        }]
      })

      return { message: 'Order placed successfully!', orderId: savedOrder._id };
    } catch (error) {
      // Handle any unexpected errors
      console.error(error);
      return { message: 'Internal Server Error' };
    }
  }


  async getUserOrders(userId: string, restaurantId: string): Promise<Order[]> {
    const userOrders = await this.orderModel.find({
      userId,
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    return userOrders;
  }
}