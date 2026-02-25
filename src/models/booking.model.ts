import mongoose, { Document, Schema } from 'mongoose';

const bookingItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema: Schema = new Schema(
  {
    draftId: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: { type: [bookingItemSchema], required: true },
    total: { type: Number, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    frequency: { type: String, required: true },
    package: { type: String },
    packageName: { type: String },
    address: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
    },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export interface IBooking extends Document {
  draftId?: string;
  userId?: mongoose.Types.ObjectId;
}

export const BookingModel = mongoose.model<IBooking>('Booking', bookingSchema);
