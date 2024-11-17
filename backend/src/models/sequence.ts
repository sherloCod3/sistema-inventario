// src/models/sequence.ts
import { Schema, model } from 'mongoose';

interface ISequence {
  _id: string;
  seq: number;
}

const sequenceSchema = new Schema<ISequence>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const SequenceModel = model<ISequence>('Sequence', sequenceSchema);