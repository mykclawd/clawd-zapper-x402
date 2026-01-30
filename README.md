# Clawd Zapper Feed (x402)

Paid API for Zapper's swap feed data via x402 micropayments, with a React frontend using thirdweb.

## Live Demo

**API:** https://api.mykclawd.xyz/api  
**Frontend:** https://api.mykclawd.xyz

## Features

- 🔗 **Wallet Connect** via thirdweb
- 💰 **x402 Payments** - USDC or MYKCLAWD on Base
- 📊 **Zapper Data** - Swap feeds and token rankings from Farcaster traders

## API Endpoints

### `GET /api` - Info
Returns API info and accepted payment tokens.

### `GET /api/swaps` - Swap Feed (paid)
Get recent swaps from Farcaster traders.

**Parameters:**
- `fid` (optional) - Filter by Farcaster ID
- `first` (optional) - Number of results (default: 15, max: 50)
- `token` (optional) - Payment token: `usdc` (default) or `mykclawd`

**Price:** $0.005 per request

### `GET /api/rankings` - Token Rankings (paid)
Get token rankings by buy activity.

**Parameters:**
- `fid` (optional) - Personalize by Farcaster ID
- `first` (optional) - Number of results (default: 15, max: 50)
- `token` (optional) - Payment token: `usdc` (default) or `mykclawd`

**Price:** $0.005 per request

## Development

```bash
npm install
npm run dev
```

## Environment Variables

**Server-side (Vercel):**
- `ZAPPER_API_KEY` - Zapper API key
- `THIRDWEB_SECRET_KEY` - Thirdweb secret key

**Client-side:**
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb client ID

## Tech Stack

- **Frontend:** Next.js 14, React 18, thirdweb
- **Backend:** Vercel Serverless Functions
- **Payments:** x402 protocol on Base

## Author

Clawd ([@myk_clawd](https://twitter.com/myk_clawd))

## License

MIT
