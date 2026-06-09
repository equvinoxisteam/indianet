# Indianet Production Checklist

This checklist helps you move the app from local/dev to a production-ready deployment.

## 1) Environment Variables

### Server (`MultiVendor-Ecommerce/SERVER/.env`)
- Verify all required values exist:
  - `PORT`
  - `DB_URL`, `DB_NAME` (or just `DB_URL` depending on your setup)
  - `JWT_SECRET` (must be changed from default)
  - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASS`, `SHIPROCKET_PICKUPID`
  - `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
  - `ADMIN_MAIL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `RAZORPAY_ID`, `RAZORPAY_SECREt`
- Security: ensure secrets were rotated after any accidental exposure.
  - Shiprocket note: `SHIPROCKET_PASS` must contain the rotated password (this repo’s `.env` may be intentionally blank in dev).
- Ensure you did **not** commit `.env` files.

### Client (`MultiVendor-Ecommerce/Client/.env.local`)
- Verify:
  - `ServerUrl` / `ServerId` (the API base URLs)
- Ensure the URL matches your production domain (HTTPS).

## 2) Build Verification (Storefront)

From `MultiVendor-Ecommerce/Client`:
- `npm install`
- `npm run build`
- `npm start`

If `next build` passes, the UI compilation is good for production.

## 3) Build Verification (Backend)

From `MultiVendor-Ecommerce/SERVER`:
- `npm install`
- Start backend:
  - `npm start`

Ensure the server boots without environment-related runtime failures.

## 4) CORS / API Origin

Backend currently uses `app.use(cors())` with default settings.
- In production, restrict CORS to your frontend domain(s) if possible.
- Confirm your reverse proxy (Nginx/Cloudflare/etc.) forwards headers correctly.

## 5) Authentication / Tokens

Confirm:
- JWT auth uses `x-access-token` and `JWT_SECRET` is consistent across restarts.
- Vendor/admin tokens are stored and refreshed as expected:
  - `vendorToken`, `adminToken`

## 6) Shiprocket Courier Readiness

### IP Whitelisting
- Shiprocket requires whitelisting the server’s public IP(s) allowed to call Shiprocket APIs.
- Confirm the IP of your production server (or NAT gateway / load balancer) is whitelisted in Shiprocket.

### Pickup Address
- Confirm `SHIPROCKET_PICKUPID` corresponds to the configured Shiprocket pickup address.

## 7) Razorpay Readiness

Confirm:
- `RAZORPAY_ID` and `RAZORPAY_SECREt` match the environment (live vs test).
- Webhook handling (if you add any later) is configured and reachable.

## 8) Deployment / Runtime Notes

- Serve `SERVER` and `Client` appropriately (or use a reverse proxy).
- Use HTTPS in production.
- Ensure Node/NPM versions are compatible with your current dependencies.

## 9) Smoke Tests (Must Do)

1. Admin login and RFQ list access
2. Vendor RFQ list and quote submission
3. Storefront:
   - RFQ products show “Request for Quote” but do not reveal price
   - Non-RFQ products can still be added to cart and checked out
4. COD + Razorpay flows for non-RFQ products
5. Shiprocket order creation + tracking for shipped orders

