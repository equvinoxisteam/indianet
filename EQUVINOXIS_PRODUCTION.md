# Indianet production — equvinoxis.com

**Domain:** `indianet.equvinoxis.com`  
**API:** `api.indianet.equvinoxis.com`  
**Admin:** `team@equvinoxis.com`  
**Database:** MongoDB Atlas (not S3)  
**Files/images:** AWS S3 (not the database)

---

## Quick reference — what each service does

| Service | Purpose | You need |
|---------|---------|----------|
| **MongoDB Atlas** | Users, products, orders, RFQs | Free cluster + connection string |
| **AWS S3** | Product images, vendor logos, banners | Bucket + IAM keys |
| **Gmail** | OTP emails (buyer/vendor) | App Password |
| **Railway** | Host API + website | 2 services |
| **GoDaddy** | DNS for subdomain | CNAME records |
| **Razorpay** | Online payments | Already in your `.env` |

**S3 is NOT the database.** MongoDB stores data. S3 stores uploaded files only.

---

# PART A — MongoDB Atlas (database)

### Step 1: Create account
1. Open [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (Google login is fine)

### Step 2: Create free cluster
1. **Build a Database** → **M0 FREE**
2. Provider: **AWS**, Region: **Mumbai (ap-south-1)** (closest to India)
3. Cluster name: `indianet-cluster` → **Create**

### Step 3: Database user
1. Left menu → **Database Access** → **Add New Database User**
2. Username: `indianet_app`
3. Password: click **Autogenerate Secure Password** → **copy and save it**
4. Privileges: **Read and write to any database**
5. **Add User**

### Step 4: Network access
1. **Network Access** → **Add IP Address**
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`)  
   (Required for Railway — Atlas still needs username/password)

### Step 5: Get connection string
1. **Database** → **Connect** → **Drivers** → Node.js
2. Copy the string:
   ```
   mongodb+srv://indianet_app:<password>@indianet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your saved password.  
   If password has `@`, `#`, etc., URL-encode them (`@` → `%40`).

### Step 6: Railway variable (Server service)
```env
DB_URL=mongodb+srv://indianet_app:YOUR_PASSWORD@indianet-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=indianet
```

---

# PART B — Gmail (email / OTP)

Emails are sent from your Gmail via an **App Password** (not your normal Gmail password).

### Step 1: Turn on 2-Step Verification
1. [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### Step 2: Create App Password
1. [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. App: **Mail**, Device: **Other** → name: `Indianet`
3. Click **Generate** → copy the **16-character password** (e.g. `abcd efgh ijkl mnop`)

### Step 3: Railway variables (Server)
```env
MAIL_USER=aniketh0701@gmail.com
MAIL_PASS=abcd efgh ijkl mnop
MAIL_FROM=Indianet <aniketh0701@gmail.com>
ADMIN_MAIL=team@equvinoxis.com
SUPPORT_EMAIL=team@equvinoxis.com
```

**Note:** If `team@equvinoxis.com` is a Google Workspace inbox, you can use that for `MAIL_USER` instead and create an app password on that account.

---

# PART C — AWS S3 (images & uploads)

### Step 1: AWS account
1. [https://aws.amazon.com](https://aws.amazon.com) → Create account (credit card required; S3 usage for a new store is usually low cost)

### Step 2: Create bucket
1. AWS Console → **S3** → **Create bucket**
2. Name: `indianet-equvinoxis` (must be globally unique — add numbers if taken)
3. Region: **Asia Pacific (Mumbai) ap-south-1**
4. **Uncheck** “Block all public access” (images must be public)  
   Confirm the warning
5. Create bucket

### Step 3: Bucket policy (public read for images)
1. Open bucket → **Permissions** → **Bucket policy** → Edit:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::indianet-equvinoxis/*"
    }
  ]
}
```

Replace `indianet-equvinoxis` with your bucket name.

### Step 4: IAM user for the app
1. **IAM** → **Users** → **Create user** → name: `indianet-s3-uploader`
2. Attach policy **AmazonS3FullAccess** (or a custom policy scoped to your bucket)
3. **Security credentials** → **Create access key** → **Application running outside AWS**
4. Copy **Access key ID** and **Secret access key**

### Step 5: Railway variables (Server)
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=indianet-equvinoxis
S3_PUBLIC_URL=https://indianet-equvinoxis.s3.ap-south-1.amazonaws.com
```

### Step 6: Client variables (when S3 is active)
```env
ServerUrl=https://api.indianet.equvinoxis.com/api
ServerId=https://indianet-equvinoxis.s3.ap-south-1.amazonaws.com
```

`ServerId` points to S3 so product/vendor images load from the bucket.

---

# PART D — Admin login

Set on Railway **Server** service:

```env
ADMIN_EMAIL=team@equvinoxis.com
ADMIN_PASSWORD=Aniketh@equvinoxis2026
ADMIN_MAIL=team@equvinoxis.com
```

On server start, the admin user is created/updated in MongoDB.  
Login: `https://indianet.equvinoxis.com/admin/login`

Also set:
```env
JWT_SECRET=<generate a long random string>
CLIENT_URL=https://indianet.equvinoxis.com
CORS_ORIGINS=https://indianet.equvinoxis.com
```

Generate JWT secret (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | % {[char]$_})
```

---

# PART E — Railway (hosting)

You need **two services** in one Railway project.

## Service 1: API (Server)

| Setting | Value |
|---------|--------|
| Root directory | `MultiVendor-Ecommerce/SERVER` |
| Build | `npm install` |
| Start | `npm start` |

Add **all** Server env vars from Parts A–D.

**Custom domain:** `api.indianet.equvinoxis.com`  
(Railway → Service → Settings → Networking → Custom Domain → copy CNAME target)

## Service 2: Website (Client)

| Setting | Value |
|---------|--------|
| Root directory | `MultiVendor-Ecommerce/Client` |
| Build | `npm install && npm run build` |
| Start | `npm start` |

```env
ServerUrl=https://api.indianet.equvinoxis.com/api
ServerId=https://indianet-equvinoxis.s3.ap-south-1.amazonaws.com
```

**Custom domain:** `indianet.equvinoxis.com`

---

# PART F — GoDaddy DNS (indianet.equvinoxis.com)

1. Log in to [GoDaddy](https://www.godaddy.com) → **My Products** → **equvinoxis.com** → **DNS**
2. Add records (Railway gives you the exact CNAME targets after you add custom domains):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `indianet` | `xxxx.up.railway.app` (from Railway Client) | 600 |
| CNAME | `api.indianet` | `yyyy.up.railway.app` (from Railway Server) | 600 |

**Important:** Use `api.indianet` as the name (not `api.indianet.equvinoxis.com` — GoDaddy adds the domain).

3. Wait 5–60 minutes for DNS propagation
4. In Railway, verify both custom domains show **Active / Valid**

### Optional: redirect www
If you want `www.equvinoxis.com` elsewhere, leave it as is. Indianet lives only on `indianet.equvinoxis.com`.

---

# PART G — Full Railway env checklist (Server)

Copy this block and fill in real values:

```env
PORT=5000
DB_URL=mongodb+srv://indianet_app:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=indianet
JWT_SECRET=your-long-random-secret

CLIENT_URL=https://indianet.equvinoxis.com
CORS_ORIGINS=https://indianet.equvinoxis.com
SUPPORT_EMAIL=team@equvinoxis.com

MAIL_USER=aniketh0701@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=Indianet <aniketh0701@gmail.com>

ADMIN_MAIL=team@equvinoxis.com
ADMIN_EMAIL=team@equvinoxis.com
ADMIN_PASSWORD=Aniketh@equvinoxis2026

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=indianet-equvinoxis
S3_PUBLIC_URL=https://indianet-equvinoxis.s3.ap-south-1.amazonaws.com

RAZORPAY_ID=rzp_live_...
RAZORPAY_SECREt=...

SHIPROCKET_EMAIL=
SHIPROCKET_PASS=
SHIPROCKET_PICKUPID=Delhi
```

---

# PART H — After deploy: test checklist

1. `https://api.indianet.equvinoxis.com/health` → `{ ok: true, db: true, storage: "s3" }`
2. Admin login at `/admin/login` with `team@equvinoxis.com`
3. Buyer signup → OTP email arrives (HTML template)
4. Vendor OTP login email works
5. Upload product image → image URL loads from S3
6. Submit RFQ → email to `team@equvinoxis.com`
7. Razorpay test payment on a non-RFQ product

---

# Do you need anything else?

| Item | When |
|------|------|
| **Shiprocket** | Only if you ship physical goods with their courier |
| **Google Workspace** | If you want `team@equvinoxis.com` to send mail (optional; Gmail works for now) |
| **SSL** | Automatic via Railway custom domains |
| **Backups** | Enable Atlas **Cloud Backup** on paid tier, or export periodically |
| **Monitoring** | Railway logs + Atlas metrics |

---

# Local development vs production

| | Local | Production |
|---|-------|------------|
| `DB_URL` | `mongodb://127.0.0.1:27017` | Atlas `mongodb+srv://...` |
| S3 vars | Empty → uses `./uploads` folder | Fill AWS keys |
| `ServerId` | `http://localhost:5000` | S3 URL or API URL |
| Admin | Same credentials from `.env` | Railway variables |

Never commit `.env` to Git. Only `.env.example` is in the repo.
