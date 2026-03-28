# Indianet

Indianet is a multi-vendor ecommerce platform for online shopping. Sellers can register as vendors, and administrators manage the marketplace from a dedicated admin panel.

## Main Features

- Pwa
- Offline Mode
- Courier Service - Shiprocket
- PinCode available check
- Order Live Tracking
- Cart & Wishlist & Direct Buy Now Option
- Live Chat
- Variant
- Vendor
- Admin Panel Dedicated
- Responsive Design
- Razorpay Payment and COD
- Razorpay Offers Accessible
- Cupon Code
- User Can Manage Address [Add , Edit , Delete]

## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

- Node Js & Npm [Download and Install](https://nodejs.org/en)
- MongoDB [Download and Install](https://www.mongodb.com/docs/manual/installation/)
- Git [Download and Install](https://git-scm.com/downloads)

## Technology Used

#nextjs #reactjs #scss

#nodejs #expressjs #mongodb #jsonwebtoken authentication

#javascript

## Environment Variables

To run this project, add environment variables to a `.env` file in the `SERVER` directory (see `SERVER/.env.example`). Typical values:

`PORT` = `5000`

`DB_URL` (e.g. `mongodb://127.0.0.1:27017`)

`DB_NAME` (e.g. `indianet`)

`JWT_SECRET`

`SHIPROCKET_EMAIL`

`SHIPROCKET_PASS`

`SHIPROCKET_PICKUPID` = `Delhi`

`MAIL_USER`

`MAIL_PASS`

`MAIL_FROM` = `Indianet <email@gmail.com>`

`ADMIN_MAIL` (notification recipient)

`ADMIN_EMAIL` and `ADMIN_PASSWORD` — used on server start to upsert the MongoDB `admin` user for `/admin/login` (change `ADMIN_PASSWORD` in production).

`RAZORPAY_ID`

`RAZORPAY_SECREt`

The **Client** uses `.env.local` with `ServerId` and `ServerUrl` pointing at your API (for example `http://localhost:5000` and `http://localhost:5000/api`).

## Run Locally

### Start backend

```bash
cd MultiVendor-Ecommerce/SERVER
npm install
npm start
```

### Start frontend

```bash
cd MultiVendor-Ecommerce/Client
npm install
npm run dev
```

Open the app at the URL shown (usually `http://localhost:3000`). Store, vendor, and admin UIs are routes in the same Next.js app (`/`, `/vendor/...`, `/admin/...`).
