import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckLog extends Document {
  monitorId: mongoose.Types.ObjectId;
  statusCode?: number;
  responseTime?: number;
  timestamp: Date;
  error?: string;
}

const CheckLogSchema: Schema = new Schema({
  monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true },
  statusCode: { type: Number },
  responseTime: { type: Number },
  timestamp: { type: Date, default: Date.now },
  error: { type: String },
});

// TTL Index for 7 days (604800 seconds)
CheckLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });
CheckLogSchema.index({ monitorId: 1, timestamp: -1 });

export default mongoose.model<ICheckLog>('CheckLog', CheckLogSchema);
