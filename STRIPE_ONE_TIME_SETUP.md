# Stripe One-Time Payment Setup

## The Problem
Your current `STRIPE_PRICE_ID` is configured for **recurring/subscription** payments, but we changed the app to use **one-time payments**. Stripe won't allow recurring prices in `payment` mode.

## Solution: Create One-Time Price

### 1. Go to Stripe Dashboard
- Visit: https://dashboard.stripe.com/products
- Login to your Stripe account

### 2. Create New Product (if needed)
- Click "Add product"
- **Name**: `Lab Analysis Report`
- **Description**: `AI-powered lab results analysis with lifestyle recommendations`

### 3. Create One-Time Price
- In your product, click "Add price"
- **Price**: Enter your desired amount (e.g., `29.00` for $29)
- **Currency**: `USD` (or your preferred currency)
- **Billing**: Select **"One time"** (NOT recurring!)
- Click "Save price"

### 4. Copy the New Price ID
- After creating, you'll see a price ID like: `price_1AbCdEfGhIjKlMnO`
- Copy this ID

### 5. Update Railway Environment Variable
- Go to Railway dashboard: https://railway.app/dashboard
- Select your project
- Go to "Variables" tab
- Update `STRIPE_PRICE_ID` with your new one-time price ID
- Deploy the changes

## Alternative: Quick Fix via Stripe CLI

If you have Stripe CLI installed:

```bash
# Create one-time price
stripe prices create \
  --currency=usd \
  --unit-amount=2900 \
  --product_data[name]="Lab Analysis Report" \
  --product_data[description]="AI-powered lab results analysis"

# Copy the returned price ID and update Railway
```

## Test After Update
1. Wait 2-3 minutes for Railway deployment
2. Visit: https://app.labwise.rialys.eu/checkout
3. Click "Secure Checkout" - should work now!
4. Use test card: `4242 4242 4242 4242`

The error will be fixed once you update the `STRIPE_PRICE_ID` to a one-time price! 🎯
