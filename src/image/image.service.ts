/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './image.model';

@Injectable()
export class ImageService {
  constructor(@InjectModel('Image') private readonly imageModel: Model<Image>) {}

  async saveImage(imageUrl: string, compress: number): Promise<any> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      const originalFileName = 'original.jpg';
      const thumbFileName = 'thumb.jpg';
      const imagesDirectory = 'images';

      await sharp(imageBuffer)
        .toFile(`${imagesDirectory}/${originalFileName}`);

      const { width, height } = await sharp(imageBuffer).metadata();
      const maxDimension = Math.max(width, height);
      const resizeOptions = maxDimension > 720 ? { width: 720 } : {};

      await sharp(imageBuffer)
        .resize(resizeOptions)
        .jpeg({ quality: compress })
        .toFile(`${imagesDirectory}/${thumbFileName}`);

      const metadata = await sharp(imageBuffer).metadata();

      // Registrar metadados no MongoDB
      const savedImage = await this.imageModel.create({
        originalPath: `${imagesDirectory}/${originalFileName}`,
        thumbPath: `${imagesDirectory}/${thumbFileName}`,
        metadata: metadata.exif || {},
      });

      return {
        localpath: {
          original: savedImage.originalPath,
          thumb: savedImage.thumbPath,
        },
        metadata: savedImage.metadata,
      };
    } catch (error) {
      throw new BadRequestException('Failed to save image.');
    }
  }
}
