import { Request, Response } from 'express';
import bookingRepository from '../repositories/booking.repository';
import paymentRepository from '../repositories/payment.repository';

const stripeSecret = process.env.STRIPE_SECRET || '';
let stripe: any = null;
if (stripeSecret) {
  // load stripe at runtime to avoid TypeScript compile errors when the package isn't installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StripeLib = require('stripe');
  stripe = new StripeLib(stripeSecret, { apiVersion: '2023-08-16' });
}

class PaymentController {
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return res.status(400).json({ success: false, error: { message: 'bookingId required' } });

      const booking = await bookingRepository.findById(bookingId);
      if (!booking) return res.status(404).json({ success: false, error: { message: 'Booking not found' } });

      // create a payment record (created)
      const payment = await paymentRepository.createPayment({
        userId: booking.userId || null,
        bookingId: booking._id,
        amount: Number(booking.total) || 0,
        currency: 'INR',
        status: 'created',
        provider: stripe ? 'stripe' : 'mock',
      });

      // If stripe not configured, return mock success route and mark payment succeeded
      if (!stripe) {
        await paymentRepository.update(String(payment._id), { status: 'succeeded', providerSessionId: 'mock_session' });
        await bookingRepository.updateStatus(bookingId, 'paid');
        return res.json({ success: true, data: { mock: true, redirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/confirm/success?bookingId=${bookingId}` } });
      }

      const line_items = (booking.items || []).map((it: any) => ({
        price_data: {
          currency: 'inr',
          product_data: { name: it.name },
          unit_amount: Math.round(Number(it.price) * 100),
        },
        quantity: Number(it.qty) || 1,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/confirm/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/confirm?bookingId=${bookingId}`,
        metadata: { bookingId },
      });

      // update payment with provider session id and set processing
      if (payment && payment._id) {
        await paymentRepository.update(String(payment._id), { providerSessionId: session.id, status: 'processing' });
      }

      return res.json({ success: true, data: { url: session.url, id: session.id, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' } });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create checkout session' } });
    }
  }

  async webhook(req: Request, res: Response) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      console.warn('No STRIPE_WEBHOOK_SECRET configured');
      return res.status(400).send('Webhook not configured');
    }

    const sig = req.headers['stripe-signature'] as string | undefined;
    const raw = req.body as Buffer;
    try {
        // dynamically load stripe for webhook processing
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const StripeLib = require('stripe');
        const stripeLocal = new StripeLib(process.env.STRIPE_SECRET || '', { apiVersion: '2023-08-16' });
        const event = stripeLocal.webhooks.constructEvent(raw, sig || '', webhookSecret);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          // update payment record (find by providerSessionId or bookingId) and mark succeeded
          try {
            const providerSessionId = session.id;
            // try update by session id
            let updatedPayment = null;
            if (providerSessionId) {
              const payments = await paymentRepository.findByBooking(bookingId);
              // prefer payment with matching session id
              updatedPayment = payments.find((p: any) => String(p.providerSessionId) === String(providerSessionId));
            }
            if (updatedPayment && updatedPayment._id) {
              await paymentRepository.update(String(updatedPayment._id), { status: 'succeeded' });
            } else {
              // fallback: update latest payment for booking
              const payments = await paymentRepository.findByBooking(bookingId);
              if (payments && payments.length > 0) {
                await paymentRepository.update(String(payments[0]._id), { status: 'succeeded', providerSessionId: session.id });
              }
            }
          } catch (e: any) {
            console.warn('Failed to update payment record from webhook', e?.message || e);
          }
          await bookingRepository.updateStatus(bookingId, 'paid');
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error', err?.message || err);
      res.status(400).send(`Webhook Error: ${err?.message || err}`);
    }
  }
}

export default new PaymentController();
