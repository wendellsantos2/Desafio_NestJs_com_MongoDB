import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageController } from './image/image.controller';
import { ImageSchema } from './image/image.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/image-api'),
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
  ],
  controllers: [ImageController],
})
export class AppModule {}
