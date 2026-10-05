# I-Surf Dashboard

A Next.js dashboard using Firebase, including the Authentication and Realtime Database SDKs. The current home page displays the value at `test/hello` and its connection status.

## Requirements

- Node.js 20.9 or later
- npm (included with Node.js)
- A Firebase project with Realtime Database enabled

## Setup

1. Clone the repository and open the project directory:

   ```bash
   git clone <repository-url>
   cd I-Surf_Dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and fill in the Firebase web app settings:

   ```dotenv
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-database-url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
   ```

   Find these values in the Firebase console under **Project settings > General > Your apps**. Get the Realtime Database URL from **Build > Realtime Database**. The `.env.local` file is excluded from Git.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Restart the development server after changing `.env.local`.

## Firebase behavior

The home page listens to the Realtime Database path `test/hello`. Create that path in your database to display a value. The current page does not sign users in, so database rules that require an authenticated user will reject its read until an authentication flow is added. The Firebase web configuration is supplied to client-side code; `NEXT_PUBLIC_` values are public and must not be treated as secrets. Protect data with Firebase Security Rules, and never put private service-account credentials in this app.

## Available commands

| Command         | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `npm run dev`   | Start the development server with hot reload.                  |
| `npm run lint`  | Run ESLint.                                                    |
| `npm run build` | Build the production app.                                      |
| `npm run start` | Serve the production build locally. Run `npm run build` first. |

## Production build

```bash
npm run build
npm run start
```

Set the same Firebase environment variables in your hosting provider's environment configuration before building/deploying. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for hosting options.
