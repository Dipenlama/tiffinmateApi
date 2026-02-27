import BookingModel, { IBookingItem } from '../models/booking.model';
import bookingRepository from '../repositories/booking.repository';
import { CreateBooking, UpdateStatusDto } from '../dtos/booking.dto';
import { HttpError } from '../errors/http-error';

class BookingService {
	validateItems(items: any[]) {
		if (!items || !Array.isArray(items) || items.length === 0) {
			throw new HttpError(400, 'items must be a non-empty array');
		}
		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (!it.id || !it.name) throw new HttpError(400, `item[${i}].id and name are required`);
			if (!Number.isInteger(it.qty) || it.qty < 1) throw new HttpError(400, `item[${i}].qty must be >= 1`);
			if (typeof it.price !== 'number' || it.price < 0) throw new HttpError(400, `item[${i}].price must be >= 0`);
		}
	}

	async createBooking(userId: string | null, payload: CreateBooking) {
		this.validateItems(payload.items);
		const { items, total } = (BookingModel as any).computeTotals(payload.items as IBookingItem[]);
		const bookingData = {
			userId: userId || null,
			package: payload.package,
			packageName: payload.packageName,
			day: payload.day,
			time: payload.time,
			items,
			total,
			status: 'pending',
			metadata: payload.metadata,
		};
		const created = await bookingRepository.createBooking(bookingData as any);
		return created;
	}

	async getById(id: string) {
		const b = await bookingRepository.findById(id);
		if (!b) throw new HttpError(404, 'Booking not found');
		return b;
	}

	async listForUser(userId: string, page = 1, limit = 10) {
		return bookingRepository.findByUser(userId, page, limit);
	}

	async listAll(page = 1, limit = 10, filters: any = {}) {
		return bookingRepository.listAll(page, limit, filters);
	}

	async deleteBooking(id: string, currentUser: any) {
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new HttpError(404, 'Booking not found');
		const isOwner = booking.userId && String(booking.userId) === String(currentUser?._id || currentUser?.id);
		const isAdmin = currentUser?.role === 'admin';
		if (!isOwner && !isAdmin) throw new HttpError(403, 'Forbidden');
		return bookingRepository.deleteBooking(id);
	}

	async updateStatus(id: string, payload: unknown, currentUser: any) {
		const parsed = UpdateStatusDto.safeParse(payload);
		if (!parsed.success) throw new HttpError(400, 'Invalid status');
		const isAdmin = currentUser?.role === 'admin';
		if (!isAdmin) throw new HttpError(403, 'Forbidden');
		const booking = await bookingRepository.findById(id);
		if (!booking) throw new HttpError(404, 'Booking not found');
		return bookingRepository.updateStatus(id, parsed.data.status);
	}
}

export default new BookingService();
