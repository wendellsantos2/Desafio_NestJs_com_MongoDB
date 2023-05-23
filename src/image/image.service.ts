import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';

import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImageService {
  async saveImage(createImageDto: CreateImageDto): Promise<any> {
    const { image } = createImageDto;

    try {
      const outputPath = '/path/to/image.jpg';

      await sharp(image).toFile(outputPath);

      return { localpath: outputPath };
    } catch (error) {
      throw new BadRequestException('Failed to save image.');
    }
  }
}
