import mongoose, { Schema, Document } from 'mongoose';

export interface IMonitor extends Document {
  url: string;
  name?: string;
  status: 'UP' | 'DOWN' | 'PENDING';
  lastResponseTime?: number;
  lastChecked?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MonitorSchema: Schema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    name: { type: String },
    status: { type: String, enum: ['UP', 'DOWN', 'PENDING'], default: 'PENDING' },
    lastResponseTime: { type: Number },
    lastChecked: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMonitor>('Monitor', MonitorSchema);
