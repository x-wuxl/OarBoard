# OarBoard

OarBoard is a rowing dashboard built on Next.js 16. It visualizes Mok Fitness workout data with an Apple Fitness-inspired hero, a live dashboard, a calendar heatmap, and detail charts.

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a local `.env.local` file based on `.env.example` or set the same values in Vercel:

```bash
MOKE_ACCOUNT_ID=your-account-id
MOKE_AUTHORIZATION=your-token-here
MOKE_BASE_URL=http://data.mokfitness.cn
```

### Vercel

In the Vercel project settings, add:

- `MOKE_ACCOUNT_ID`
- `MOKE_AUTHORIZATION`
- `MOKE_BASE_URL`

`MOKE_AUTHORIZATION` is read on the server and injected into the `/api/moke/[...path]` proxy.
`MOKE_ACCOUNT_ID` is required for live user data requests.

## Token Expiry

If the proxy cannot use a valid token and the request fails with an authorization problem, the UI shows a warning banner telling you to update `MOKE_AUTHORIZATION`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```
