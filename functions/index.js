const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

// Create Stripe Checkout Session for donations
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method not allowed' });
    return;
  }

  try {
    const { amount, userId, metadata } = req.body;

    if (!amount || !userId) {
      res.status(400).send({ error: 'Missing required fields' });
      return;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation',
              description: 'Support the project',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?donation=cancelled`,
      metadata: {
        userId,
        type: metadata?.type || 'donation',
      },
      customer_email: null, // Don't pre-fill email for security
    });

    res.status(200).send({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send({ error: error.message });
  }
});

// Stripe Webhook handler for payment confirmation
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, type } = session.metadata;

        if (type === 'donation' && userId) {
          // Create donation record in Firestore
          await admin.firestore().collection('donations').add({
            userId,
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            sessionId: session.id,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentIntentId: session.payment_intent,
          });

          console.log(`Donation recorded for user ${userId}: $${session.amount_total / 100}`);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const { userId, type } = session.metadata;

        if (type === 'donation' && userId) {
          // Record expired session
          await admin.firestore().collection('donations').add({
            userId,
            amount: session.amount_total / 100,
            currency: session.currency,
            sessionId: session.id,
            status: 'expired',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send({ error: error.message });
  }
});
