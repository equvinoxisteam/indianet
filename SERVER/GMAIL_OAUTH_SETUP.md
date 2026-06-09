# Gmail OAuth2 setup (Indianet — all OTP & transactional email)

Railway **blocks SMTP**. This project sends mail via the **Gmail REST API** (HTTPS), using OAuth2 refresh tokens — not SMTP app passwords.

Works for: buyer signup OTP, forgot password, vendor login OTP, admin login alerts, RFQ notifications, order cancel/return emails.

---

## Step 1 — Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (e.g. `indianet-mail`) or select an existing one
3. **APIs & Services → Library** → search **Gmail API** → **Enable**

---

## Step 2 — OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. User type:
   - **Internal** — if `info@equvinoxis.com` is Google Workspace (recommended)
   - **External** — personal Gmail; add test users until verified
3. App name: `Indianet`
4. Support email: your email
5. Scopes: add `https://mail.google.com/` (full Gmail send)
6. Save

---

## Step 3 — OAuth client credentials

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: `Indianet Server`
4. **Authorized redirect URIs** — add exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Create → copy **Client ID** and **Client Secret**

---

## Step 4 — Get refresh token (OAuth Playground)

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the **gear icon** (top right) → check **Use your own OAuth credentials**
3. Paste your **Client ID** and **Client Secret**
4. In the left list, find **Gmail API v1** → select:
   ```
   https://mail.google.com/
   ```
5. Click **Authorize APIs** → sign in as **`info@equvinoxis.com`** (the account that will send mail)
6. Click **Exchange authorization code for tokens**
7. Copy the **Refresh token** (starts with `1//...`)

> Keep the refresh token secret. If leaked, revoke it in Google Account → Security → Third-party access.

---

## Step 5 — Environment variables

### Local (`SERVER/.env`)

```env
MAIL_PROVIDER=gmail

GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-your-secret
GMAIL_REFRESH_TOKEN=1//your-refresh-token
GMAIL_USER=info@equvinoxis.com
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

MAIL_FROM=Indianet <info@equvinoxis.com>
ADMIN_MAIL=team@equvinoxis.com
```

### Railway (SERVER service → Variables)

Add the same variables. **Do not commit** real secrets to GitHub.

| Variable | Value |
|----------|--------|
| `MAIL_PROVIDER` | `gmail` |
| `GMAIL_CLIENT_ID` | from Google Cloud |
| `GMAIL_CLIENT_SECRET` | from Google Cloud |
| `GMAIL_REFRESH_TOKEN` | from OAuth Playground |
| `GMAIL_USER` | `info@equvinoxis.com` |
| `GMAIL_REDIRECT_URI` | `https://developers.google.com/oauthplayground` |
| `MAIL_FROM` | `Indianet <info@equvinoxis.com>` |

Remove or ignore `MAIL_PASS` on Railway (not needed for Gmail API).

---

## Step 6 — Test

```bash
cd SERVER
node scripts/check-env.js
```

Or redeploy Railway and check logs for:

```
Email: gmail (configured)
```

Then test vendor login OTP, buyer signup OTP, and admin login.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `invalid_grant` | Refresh token expired/revoked — repeat Step 4 |
| `Mail service not enabled` | Enable Gmail API in Cloud Console |
| `Insufficient Permission` | Re-authorize with scope `https://mail.google.com/` |
| `Connection timeout` | You are still on SMTP — set `MAIL_PROVIDER=gmail` |
| Email from wrong address | `GMAIL_USER` must match the Google account used in OAuth Playground |

---

## Security

- Never commit `GMAIL_CLIENT_SECRET` or `GMAIL_REFRESH_TOKEN` to git
- Rotate credentials if they were shared in chat or logs
- Use a dedicated Google account or Workspace user for sending (`info@equvinoxis.com`)
