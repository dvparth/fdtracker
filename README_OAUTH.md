# OAuth Setup

This backend uses Google OAuth through Passport. After a successful Google login, the server signs a short-lived JWT and stores it in an HttpOnly `mf_auth` cookie.

## Backend Environment

- `PORT` - optional backend port, defaults to `5000`
- `MONGO_URI` - MongoDB connection string for users, holdings, and scheme metadata
- `JWT_SECRET` - strong secret for signing JWTs
- `FRONTEND_URL` - frontend URL to redirect after login, for example `http://localhost:3000`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK` - optional callback URL; local default is `http://localhost:5000/auth/google/callback`

## Register Google OAuth

1. Go to Google Cloud Console.
2. Configure the OAuth consent screen.
3. Add the authorized redirect URI, for example `http://localhost:5000/auth/google/callback`.
4. Add the generated client ID and secret to the backend `.env`.

## Local Testing

```powershell
cd C:\Study\MFSnapshot\fdtracker
npm install
npm run dev
```

Then start the frontend and use the login button. The frontend calls `/auth/me` with credentials included to restore the authenticated user.

## Production Notes

- Use HTTPS in production.
- Set `FRONTEND_URL` to the production frontend origin.
- Keep Google client secrets only on the backend.
- Rotate `JWT_SECRET` if it is ever exposed.
