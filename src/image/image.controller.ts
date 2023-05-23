/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Param, Body, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import * as sharp from 'sharp';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image } from './image.model';
import * as path from 'path';

@Controller('image')
export class ImageController {
  constructor(
    @InjectModel('Image') private readonly imageModel: Model<Image>,
  ) {}

  @Post('save')
  async saveImage(
    @Body() body: { image: string; compress: number },
    @Res() res: Response,
  ) {
    const { image } = body;

    try {
      const { data } = await axios.get(image, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(data, 'binary');

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const desktopPath = path.join(require('os').homedir(), 'Desktop');
      const originalFileName = path.join(desktopPath, 'original.jpg');
      const thumbFileName = path.join(desktopPath, 'thumb.jpg');

      // Salvar imagem original
      await sharp(buffer)
        .toFile(originalFileName);

      // Redimensionar imagem
      const { width, height } = await sharp(buffer).metadata();
      const maxDimension = Math.max(width, height);
      const thumbWidth = maxDimension > 720 ? 720 : width;
      const thumbHeight = maxDimension > 720 ? (720 * height) / width : height;

      await sharp(buffer)
        .resize(thumbWidth, thumbHeight)
        .toFile(thumbFileName);

      // Registrar metadados
      const metadata = await sharp(buffer).metadata();

      // Salvar informações da imagem no MongoDB
      const savedImage = await this.imageModel.create({
        originalPath: originalFileName,
        thumbPath: thumbFileName,
        metadata,
      });

      res.status(200).json({
        localpath: {
          original: savedImage.originalPath,
          thumb: savedImage.thumbPath,
        },
        metadata: savedImage.metadata,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
          },
        ],
      });
    }
  }

  @Get()
async getAllImages(@Res() res: Response) {
  try {
    const images = await this.imageModel.find();

    res.status(200).json({
      images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      ],
    });
  }
}

}
