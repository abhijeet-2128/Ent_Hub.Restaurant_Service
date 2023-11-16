import { Module } from '@nestjs/common';
import { ProucerService } from './producet.service';
import { ConsumerService } from './consumer.service';

@Module({
    providers:[ProucerService, ConsumerService],
    exports:[ProucerService, ConsumerService]
})
export class KafkaModule {}