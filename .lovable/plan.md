

# Embed Razorpay Integration

## Current State
The code for Razorpay is already implemented — edge functions for order creation and payment verification exist, and the Pricing page has the checkout flow. However, the required secrets (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) are not yet configured.

## What's Needed

1. **Add Razorpay secrets** to the backend so the edge functions can authenticate with Razorpay's API:
   - `RAZORPAY_KEY_ID` — Your Razorpay Key ID (starts with `rzp_test_` for test mode or `rzp_live_` for production)
   - `RAZORPAY_KEY_SECRET` — Your Razorpay Key Secret

## How to Get Your Razorpay Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Generate a new key pair (use **Test Mode** keys first for testing)
5. Copy both the Key ID and Key Secret

## Implementation Steps
1. Store `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as backend secrets
2. No code changes needed — the edge functions and frontend already reference these values

Once you provide the keys, the full payment flow will be live: users hit the limit → visit pricing → pay via Razorpay → get upgraded automatically.

