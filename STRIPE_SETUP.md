# Stripe Integration Setup

This document outlines the Stripe environment variables needed for the LabWise payment integration.

## Required Environment Variables

### Stripe API Keys

```bash
# Stripe Secret Key (Server-side)
STRIPE_SECRET_KEY=sk_test_... # Test key starts with sk_test_, live key starts with sk_live_

# Stripe Publishable Key (Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Test key starts with pk_test_, live key starts with pk_live_

# Stripe Price ID for LabWise Plus subscription
STRIPE_PRICE_ID=price_... # Create this in Stripe Dashboard under Products

# Stripe Webhook Secret (for webhook signature verification)
STRIPE_WEBHOOK_SECRET=whsec_... # Get this from Stripe Dashboard webhook endpoint
```

## Setup Instructions

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Switch to Test mode for development

### 2. Get API Keys
1. Go to **Developers** → **API keys**
2. Copy the **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Reveal and copy the **Secret key** → `STRIPE_SECRET_KEY`

### 3. Create Product and Price
1. Go to **Products** → **Add product**
2. Name: "LabWise Plus"
3. Description: "Unlimited lab analysis and advanced insights"
4. Pricing: 
   - Type: Recurring
   - Price: $18.86
   - Billing period: Per analysis (or monthly/yearly as preferred)
5. Copy the **Price ID** → `STRIPE_PRICE_ID`

### 4. Setup Webhook
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://app.labwise.rialys.eu/api/auth/stripe-webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## Railway Environment Variables

Add these to your Railway project:

```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Local Development

Create a `.env.local` file in your project root:

```bash
# Copy from Railway or set directly
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_PRICE_ID=price_your_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other required variables
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_secret
```

## Testing

### Test Cards
Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Webhook Testing
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:3000/api/auth/stripe-webhook`

## Production Setup

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Get new live API keys (start with `sk_live_` and `pk_live_`)
3. Update environment variables in Railway

### 2. Update Webhook URL
1. Update webhook endpoint to production URL
2. Get new webhook secret for live mode

### 3. Verify Integration
1. Test with real payment methods
2. Monitor webhook delivery in Stripe Dashboard
3. Check Railway logs for any issues

## Security Notes

- Never commit API keys to version control
- Use test keys for development
- Verify webhook signatures to prevent fraud
- Monitor failed payments and handle gracefully
- Set up proper error logging and monitoring

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook URL is accessible
   - Verify webhook events are configured

2. **Checkout session creation fails**
   - Verify `STRIPE_SECRET_KEY` is valid
   - Check `STRIPE_PRICE_ID` exists
   - Ensure success/cancel URLs are valid

3. **Payment not processing**
   - Check webhook endpoint is receiving events
   - Verify subscription creation logic
   - Monitor Stripe Dashboard for failed events

### Support
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Guide](https://stripe.com/docs/webhooks)
