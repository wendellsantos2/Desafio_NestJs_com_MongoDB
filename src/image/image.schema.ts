/* eslint-disable prettier/prettier */
import { Schema, Document } from 'mongoose';

export interface Image extends Document {
  original: string;
  thumb: string;
}

export const ImageSchema = new Schema<Image>({
  original: String,
  thumb: String,
});
