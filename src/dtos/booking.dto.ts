import { z } from 'zod';

<<<<<<< HEAD
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
=======
export const BookingItemDto = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number().int().min(1),
  price: z.number().min(0),
  subtotal: z.number().min(0),
});

export const CreateBookingDto = z.object({
  draftId: z.string().optional(),
  items: z.array(BookingItemDto).min(1),
  total: z.number().min(0),
  day: z.string(),
  time: z.string(),
  frequency: z.preprocess((val) => {
    if (typeof val !== 'string') return val;
    const v = val.trim().toLowerCase();
    const map: Record<string, string> = {
      'once': 'once',
      'one-time': 'once',
      'one time': 'once',
      'single': 'once',
      'once-only': 'once',
      'daily': 'daily',
      'everyday': 'daily',
      'every day': 'daily',
      'weekly': 'weekly',
      'everyweek': 'weekly',
      'every week': 'weekly',
    };
    return map[v] || v;
  }, z.enum(['once', 'daily', 'weekly'])),
  package: z.string().optional(),
  packageName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBookingDtoType = z.infer<typeof CreateBookingDto>;
>>>>>>> f4a585b37e31dbd5720bfe904411b808d8a2b7ec
