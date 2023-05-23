/* eslint-disable prettier/prettier */
import { Document } from 'mongoose';

export interface Image extends Document {
  original: string;
  thumb: string;
}