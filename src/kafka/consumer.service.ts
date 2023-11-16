import { Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from "kafkajs";

@Injectable()
export class ConsumerService implements OnApplicationShutdown {

  // Connect to Kafka Server
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092']
  });

  private readonly consumers: Consumer[] = [];

  async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {

    // We need to spcifiy the groupID while initializing the Kafka Consumer
    const consumer = this.kafka.consumer({ groupId: 'nestjs-kafka' });

    // Connecting Consumer
    await consumer.connect();

    //Passing Topics to consumer
    await consumer.subscribe(topics);

    //Setting  the Consumer Config
    await consumer.run(config);
    // await consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     const orderDetails = JSON.parse(message.value.toString());
    //     console.log({
    //       orderDetails,
    //       topic: topic.toString(),
    //       partition: partition.toString(),
    //     });

    // Now you have access to the order details produced by the ProucerService
    // You can further process or log the details as needed
    //     const orderId = orderDetails.orderId; // Adjust this based on your message structure
    //     const orderMessage = orderDetails.value; // Adjust this based on your message structure
    //     console.log(`Received order details for order ${orderId}: ${orderMessage}`);
    //   },
    // });

    //Gathering all the Consumers 
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    // Disconnect all the consumer on Apllication shutdown
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }

  }

}