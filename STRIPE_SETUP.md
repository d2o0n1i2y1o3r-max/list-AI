# Stripe Donation Feature Setup

This document explains how to set up the Stripe donation feature for the application.

## Prerequisites

- A Stripe account (sign up at https://stripe.com)
- Firebase project with Cloud Functions enabled
- Node.js installed

## Step 1: Get Stripe API Keys

1. Log in to your Stripe Dashboard (https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_`)
4. Copy your **Secret key** (starts with `sk_`)

## Step 2: Configure Frontend

1. Open the `.env` file in the project root
2. Replace `your_stripe_publishable_key_here` with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

## Step 3: Configure Cloud Functions

1. Navigate to the `functions` directory
2. Copy `.env.example` to `.env`:

```bash
cd functions
cp .env.example .env
```

3. Edit `functions/.env` and add your Stripe credentials:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 4: Install Cloud Functions Dependencies

```bash
cd functions
npm install
```

## Step 5: Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your Cloud Function URL (after deployment):
   ```
   https://your-region-your-project.cloudfunctions.net/stripeWebhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copy the **Webhook signing secret** (starts with `whsec_`)
6. Add it to `functions/.env` as `STRIPE_WEBHOOK_SECRET`

## Step 6: Deploy Cloud Functions

```bash
cd functions
npm run deploy
```

Or from the project root:

```bash
firebase deploy --only functions
```

## Step 7: Update Frontend URL

After deployment, update the Cloud Function URL in `src/lib/stripe.js`:

```javascript
const response = await fetch('https://your-region-your-project.cloudfunctions.net/createCheckoutSession', {
```

Replace with your actual Cloud Function URL.

## Testing

### Test Mode

Stripe provides test mode with test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any 5-digit ZIP code.

### Test the Flow

1. Open the application
2. Go to Settings
3. Click "Donate" (Homiylik qilish)
4. Select an amount or enter custom amount
5. Click "Send" (Yuborish)
6. You'll be redirected to Stripe Checkout
7. Complete payment with test card
8. Check Firestore `donations` collection for the record

## Production Setup

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get live API keys
3. Update `.env` files with live keys
4. Redeploy Cloud Functions
5. Set up production webhook endpoint

## Security Notes

- **Never commit** `.env` files to version control
- **Never expose** secret keys in frontend code
- Always use HTTPS for webhook endpoints
- Verify webhook signatures to prevent fraud

## Firestore Structure

Donations are stored in the `donations` collection:

```javascript
{
  userId: "user_uid",
  amount: 10.00,
  currency: "usd",
  sessionId: "cs_...",
  status: "completed",
  createdAt: Timestamp,
  paymentIntentId: "pi_..."
}
```

## Troubleshooting

### "Stripe failed to initialize"
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure the key starts with `pk_`

### "Failed to create checkout session"
- Verify Cloud Functions are deployed
- Check Cloud Function logs: `firebase functions:log`
- Ensure `STRIPE_SECRET_KEY` is set in functions environment

### Webhook not working
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure webhook events are selected in Stripe Dashboard
- Check Cloud Function logs for errors

## Support

For issues with:
- **Stripe API**: https://stripe.com/docs
- **Firebase Cloud Functions**: https://firebase.google.com/docs/functions
- **This implementation**: Check the code in `src/lib/stripe.js` and `functions/index.js`
