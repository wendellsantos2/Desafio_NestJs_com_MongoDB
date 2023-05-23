/* eslint-disable prettier/prettier */
import { Schema, Document } from 'mongoose';

export interface Image extends Document {
  originalPath: string;
  thumbPath: string;
  metadata: Record<string, any>;
}

export const ImageSchema = new Schema<Image>({
  originalPath: String,
  thumbPath: String,
  metadata: Schema.Types.Mixed,
});