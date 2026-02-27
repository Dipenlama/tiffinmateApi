import { z } from 'zod';

const normalizePackage = (value: string) => {
	const v = (value || '').trim().toLowerCase();
	if (v === 'veg' || v === 'vegetarian') return 'Veg';
	if (v === 'non-veg' || v === 'nonveg' || v === 'non veg') return 'Non-Veg';
	if (v === 'mixed' || v === 'mix') return 'Mixed';
	if (v === 'premium') return 'Premium';
	return value; // leave as-is to let validation fail
};

const normalizeTime = (value: string) => {
	const v = (value || '').trim().toLowerCase();
	if (v === 'breakfast') return 'Breakfast';
	if (v === 'lunch') return 'Lunch';
	if (v === 'dinner') return 'Dinner';
	return value;
};

export const BookingItemDto = z.object({
	id: z.string(),
	name: z.string(),
	qty: z.number().int().min(1),
	price: z.number().min(0),
});

export const CreateBookingDto = z
	.object({
		package: z.string(),
		packageName: z.string().optional(),
		day: z.string(),
		time: z.string(),
		items: z.array(BookingItemDto).min(1),
		metadata: z.any().optional(),
	})
	.transform((data) => {
		const pkg = normalizePackage(data.package);
		const time = normalizeTime(data.time);
		return {
			...data,
			package: pkg,
			packageName: data.packageName ?? pkg,
			time,
		};
	})
	.refine((d) => ['Veg', 'Non-Veg', 'Mixed', 'Premium'].includes(d.package), {
		path: ['package'],
		message: 'Invalid package',
	})
	.refine((d) => ['Breakfast', 'Lunch', 'Dinner'].includes(d.time), {
		path: ['time'],
		message: 'Invalid time',
	});

export const UpdateStatusDto = z.object({ status: z.enum(['draft', 'pending', 'paid', 'cancelled']) });

export type CreateBooking = z.infer<typeof CreateBookingDto>;
export type BookingItem = z.infer<typeof BookingItemDto>;
