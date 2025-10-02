# OAuth setup (Google & GitHub)

This project includes a minimal OAuth integration using Passport on the backend and a simple frontend flow.

## Environment variables (backend `.env`)

- `PORT` (optional) - backend port (default 5000)
- `MONGO_URI` - if you use MongoDB for deposits
- `JWT_SECRET` - a strong secret for signing JWTs (required)
- `FRONTEND_URL` - URL to redirect after successful auth (e.g. `http://localhost:3000`)

Google settings:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK` (optional) - default is `/auth/google/callback`. If your backend runs at `http://localhost:5000`, set `http://localhost:5000/auth/google/callback`

GitHub settings:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK` (optional) - default is `/auth/github/callback`. If your backend runs at `http://localhost:5000`, set `http://localhost:5000/auth/github/callback`

## Register OAuth apps

Google:

1. Go to Google Cloud Console -> OAuth consent screen -> set up an External or Internal app.
2. Add authorized redirect URI: `http://localhost:5000/auth/google/callback` (change host/port for production).
3. Use the generated client ID and secret in your `.env`.

GitHub:

1. Go to Settings -> Developer settings -> OAuth Apps -> New OAuth App.
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:5000/auth/github/callback`
4. Use the generated client ID and secret in `.env`.

## Notes on scopes and privacy

- We request minimal scopes: `profile` + `email` for Google, `user:email` for GitHub to fetch user email addresses.
- Client secrets must only be configured on the backend (never commit them or expose on the frontend).
- JWT issued is stored as an HttpOnly cookie `fd_auth` and contains only `id`, `name`, `email`.

## Local testing

1. Create `.env` with the variables above.
2. `npm install`
3. `npm run dev`
4. Visit the frontend and click the Login button (we'll provide a frontend link to `/auth/google` or `/auth/github`).

## Production

- Use HTTPS on backend and set `FRONTEND_URL` to your production frontend URL.
- Ensure `JWT_SECRET` is strong and rotated when needed.
- Consider using a server-side session store (Redis) if you need persistent sessions instead of stateless JWTs.
