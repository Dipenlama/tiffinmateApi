import mongoose, { Document, Schema } from 'mongoose';

<<<<<<< HEAD
export type BookingStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

export interface IBookingItem {
	id: string;
	name: string;
	qty: number;
	price: number;
	subtotal: number;
}

export interface IBooking extends Document {
	userId?: mongoose.Types.ObjectId | null;
	package: 'Veg' | 'Non-Veg' | 'Mixed' | 'Premium';
	packageName: string;
	day: string;
	time: 'Breakfast' | 'Lunch' | 'Dinner' | string;
	items: IBookingItem[];
	total: number;
	status: BookingStatus;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
}

const ItemSchema = new Schema(
	{
		id: { type: String, required: true },
		name: { type: String, required: true },
		qty: { type: Number, required: true, min: 1 },
		price: { type: Number, required: true, min: 0 },
		subtotal: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const BookingSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
		package: { type: String, enum: ['Veg', 'Non-Veg', 'Mixed', 'Premium'], required: true },
		packageName: { type: String, required: true },
		day: { type: String, required: true },
		time: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
		items: { type: [ItemSchema], required: true },
		total: { type: Number, required: true, min: 0 },
		status: { type: String, enum: ['draft', 'pending', 'paid', 'cancelled'], default: 'pending' },
		metadata: { type: Schema.Types.Mixed, required: false },
	},
	{ timestamps: true }
);

BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ status: 1 });

BookingSchema.statics.computeTotals = function (items: IBookingItem[]) {
	const computed = items.map((it) => ({
		...it,
		qty: Number(it.qty),
		price: Number(it.price),
		subtotal: Number(it.qty) * Number(it.price),
	}));
	const total = computed.reduce((sum: number, i: IBookingItem) => sum + (i.subtotal || 0), 0);
	return { items: computed, total };
};

export interface BookingModelStatic extends mongoose.Model<IBooking> {
	computeTotals(items: IBookingItem[]): { items: IBookingItem[]; total: number };
}

export const BookingModel = mongoose.model<IBooking, BookingModelStatic>('Booking', BookingSchema);

export default BookingModel;
=======
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
>>>>>>> f4a585b37e31dbd5720bfe904411b808d8a2b7ec
