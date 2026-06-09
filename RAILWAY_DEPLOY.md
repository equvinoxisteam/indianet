# Deploy Indianet on Railway — step by step

This guide covers everything you need: database, email (Gmail), file storage (S3 or not), and two Railway services (API + Next.js client).

---

## What you need (summary)

| Item | Required? | What to use |
|------|-----------|-------------|
| **Database** | Yes | **MongoDB Atlas** (free M0 tier works to start) |
| **Gmail** | Yes (OTP login) | Gmail + **App Password** |
| **JWT secret** | Yes | Random long string |
| **Railway** | Yes | 2 services: Server + Client |
| **S3** | No at first | Optional later; see [File uploads](#file-uploads-s3-or-not) |
| **Razorpay** | If online pay | Live/test keys from Razorpay dashboard |
| **Shiprocket** | If shipping | API email/password + IP whitelist |
| **Custom domain** | Recommended | Point DNS to Railway |

---

## Architecture on Railway

```
Browser
   │
   ├─► Client service (Next.js)     https://your-app.up.railway.app
   │         ServerUrl / ServerId → API base URL
   │
   └─► Server service (Express)     https://your-api.up.railway.app
             │
             ├─► MongoDB Atlas (DB_URL)
             ├─► Gmail SMTP (MAIL_USER / MAIL_PASS)
             └─► ./uploads (local disk — see storage note)
```

---

## Step 1 — MongoDB Atlas (database)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a cluster** → choose **M0 FREE** → region closest to your Railway region (e.g. Mumbai `ap-south-1`).
3. **Database Access** → Add user:
   - Username: e.g. `indianet_app`
   - Password: generate a strong password (save it).
   - Role: **Read and write to any database**.
4. **Network Access** → Add IP Address:
   - For Railway: click **Allow Access from Anywhere** (`0.0.0.0/0`)  
     (Atlas secures with username/password; Railway IPs change.)
5. **Database** → **Connect** → **Drivers** → copy connection string:
   ```
   mongodb+srv://indianet_app:<PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<PASSWORD>` with your user password (URL-encode special chars like `@` → `%40`).
7. Set database name via env var `DB_NAME=indianet` (app uses `DB_URL` + `DB_NAME`).

**Railway variables (Server service):**
```env
DB_URL=mongodb+srv://indianet_app:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=indianet
```

No separate “API key” for MongoDB — only this connection string + DB user.

---

## Step 2 — Gmail (email / OTP)

Indianet sends:
- **Buyer**: signup OTP, forgot-password OTP
- **Vendor**: login OTP
- **Admin**: welcome email (first setup), login security alert, RFQ & plan notifications

### Create Gmail App Password

1. Use a Google account (business Gmail recommended).
2. Enable **2-Step Verification**: [Google Account → Security](https://myaccount.google.com/security).
3. **App passwords**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - App: **Mail**, Device: **Other** → name it `Indianet Railway`.
   - Copy the **16-character password** (no spaces).

**Railway variables (Server service):**
```env
MAIL_USER=your.email@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=Indianet <your.email@gmail.com>
ADMIN_MAIL=team@eco-dispose.com
```

- `MAIL_USER` / `MAIL_PASS` = Gmail login + app password.
- `MAIL_FROM` = display name recipients see.
- `ADMIN_MAIL` = where RFQ alerts and admin login alerts go.

---

## Step 3 — Auth & admin login

```env
JWT_SECRET=generate-a-long-random-string-at-least-32-chars
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongAdminPassword123!
CLIENT_URL=https://your-client.up.railway.app
```

- On server start, `ADMIN_EMAIL` + `ADMIN_PASSWORD` are synced into MongoDB `admin` collection.
- Admin logs in at `/admin/login` with email + password (no OTP).
- `CLIENT_URL` is used in admin welcome emails (link to panel).

Generate JWT secret (PowerShell):
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Step 4 — Deploy Server on Railway

1. [railway.app](https://railway.app) → New Project → **Deploy from GitHub** (connect repo).
2. Add service → set **Root Directory** to `MultiVendor-Ecommerce/SERVER`.
3. **Settings → Deploy**:
   - Build command: `npm install`
   - Start command: `npm start` (runs `node app.js`)
4. **Variables** — add all Server env vars:

```env
PORT=5000
DB_URL=mongodb+srv://...
DB_NAME=indianet
JWT_SECRET=...
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=Indianet <you@gmail.com>
ADMIN_MAIL=team@eco-dispose.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=...
CLIENT_URL=https://YOUR-CLIENT.up.railway.app

# Optional — payments
RAZORPAY_ID=
RAZORPAY_SECREt=

# Optional — shipping
SHIPROCKET_EMAIL=
SHIPROCKET_PASS=
SHIPROCKET_PICKUPID=Delhi
```

5. **Networking** → Generate **public domain** → note URL, e.g. `https://indianet-api.up.railway.app`
6. API routes are under `/api/users`, `/api/admin`, `/api/vendor`.
7. Uploads served at `https://indianet-api.up.railway.app/product/...` (same origin as API host).

---

## Step 5 — Deploy Client on Railway

1. Same Railway project → **New service** → GitHub repo.
2. **Root Directory**: `MultiVendor-Ecommerce/Client`
3. **Build**: `npm install && npm run build`
4. **Start**: `npm start`
5. **Variables**:

```env
ServerUrl=https://indianet-api.up.railway.app/api
ServerId=https://indianet-api.up.railway.app
```

- `ServerUrl` = API base (must end with `/api`).
- `ServerId` = base URL for images/files (no `/api`).

6. Generate public domain for client, e.g. `https://indianet.up.railway.app`
7. Update Server `CLIENT_URL` to this client URL and redeploy Server.

---

## Step 6 — Optional: Razorpay

1. [https://dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys.
2. Use **Test** keys first, then **Live** for production.
3. Add to Server:
```env
RAZORPAY_ID=rzp_live_xxxxx
RAZORPAY_SECREt=your_secret
```

---

## Step 7 — Optional: Shiprocket

1. Shiprocket seller account → API credentials.
2. Whitelist **Railway server outbound IP** in Shiprocket (check Railway service networking or use a static egress if required).
3. Add `SHIPROCKET_EMAIL`, `SHIPROCKET_PASS`, `SHIPROCKET_PICKUPID`.

---

## File uploads: S3 or not?

**Current app stores files on local disk** (`SERVER/uploads/`). On Railway:

| Option | Pros | Cons |
|--------|------|------|
| **No S3 (default)** | Zero extra setup | Files **lost on redeploy** unless you add a volume |
| **Railway Volume** | Keep local uploads, minimal code change | Mount `/uploads` to a volume in Server settings |
| **AWS S3 / Cloudflare R2** | Best for production scale | Requires code changes to uploader |

**Recommendation for launch:**
1. Start with **Railway Volume** mounted at `/app/uploads` (or your SERVER root `uploads` folder) — **no S3 needed**.
2. Move to **S3/R2** when traffic grows.

You do **not** need S3 on day one if you use a Railway volume.

---

## Step 8 — Smoke test after deploy

1. **Admin**: `https://your-client.up.railway.app/admin/login` — use `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. **Buyer signup**: register → check Gmail for HTML OTP email.
3. **Vendor**: register → admin approves → vendor OTP login email.
4. **RFQ**: buyer submits RFQ → `ADMIN_MAIL` receives templated email.
5. **Images**: upload a product image → open URL `ServerId/product/...` in browser.

---

## Environment checklist

### Server (`MultiVendor-Ecommerce/SERVER`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | HTTP port (Railway sets automatically; 5000 is fine) |
| `DB_URL` | `mongodb+srv://...` | MongoDB Atlas connection |
| `DB_NAME` | `indianet` | Database name |
| `JWT_SECRET` | long random | Auth tokens |
| `MAIL_USER` | `you@gmail.com` | Gmail SMTP |
| `MAIL_PASS` | app password | Gmail SMTP |
| `MAIL_FROM` | `Indianet <you@gmail.com>` | From header |
| `ADMIN_MAIL` | notifications inbox | RFQ / alerts |
| `ADMIN_EMAIL` | admin login email | Dashboard login |
| `ADMIN_PASSWORD` | strong password | Dashboard login |
| `CLIENT_URL` | `https://...` | Links in emails |
| `RAZORPAY_ID` | optional | Payments |
| `RAZORPAY_SECREt` | optional | Payments |
| `SHIPROCKET_*` | optional | Courier |

### Client (`MultiVendor-Ecommerce/Client`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `ServerUrl` | `https://api.../api` | REST API |
| `ServerId` | `https://api...` | Image/file URLs |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Database is unavailable` | Check `DB_URL`, Atlas IP allowlist, password encoding |
| OTP email not sent | Verify Gmail app password; check Railway logs for `[mail]` errors |
| Images 404 after redeploy | Add Railway Volume or migrate to S3 |
| CORS errors | Ensure `ServerUrl` matches deployed API URL exactly (HTTPS) |
| Admin login fails | Confirm `ADMIN_EMAIL`/`ADMIN_PASSWORD` set; check MongoDB `admin` collection |

---

## Local vs production

| | Local | Railway |
|---|-------|---------|
| Server `.env` | `SERVER/.env` | Railway Variables |
| Client `.env.local` | `Client/.env.local` | Railway Variables |
| MongoDB | `mongodb://127.0.0.1:27017` | Atlas `mongodb+srv://...` |
| Email | Same Gmail app password works | Same |

Copy `SERVER/.env.example` as a template — never commit real `.env` files.
