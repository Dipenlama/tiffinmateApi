import { BookingModel } from '../models/booking.model';
import mongoose from 'mongoose';

export class BookingService {
  async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findById(id).lean();
  }

  async findByDraftIdOrIdempotency(draftId?: string) {
    if (!draftId) return null;
    return BookingModel.findOne({ draftId }).lean();
  }

  async create(payload: any) {
    const booking = await BookingModel.create(payload) as any;
    if (Array.isArray(booking)) return booking.map((b) => (b.toObject ? b.toObject() : b));
    return booking && booking.toObject ? booking.toObject() : booking;
  }

  async listByUser(userId: string, page = 1, limit = 20, status?: string) {
    const query: any = { userId };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BookingModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BookingModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  }

  async listAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      BookingModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BookingModel.countDocuments({}),
    ]);
    return { data, total, page, limit };
  }

  async updateStatus(id: string, status: string) {
    return BookingModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }

  async markPaymentProcessing(id: string) {
    return BookingModel.findByIdAndUpdate(id, { paymentStatus: 'processing' }, { new: true }).lean();
  }

  async markPaid(id: string) {
    return BookingModel.findByIdAndUpdate(id, { paymentStatus: 'paid', status: 'accepted' }, { new: true }).lean();
  }
}

export const bookingService = new BookingService();
