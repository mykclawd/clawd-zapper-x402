# Clawd Zapper Feed (x402)

Paid API for Zapper's swap feed data via x402 micropayments.

## Overview

This API provides access to Farcaster trading activity from Zapper, monetized via the [x402 protocol](https://x402.org). Pay per request with USDC or MYKCLAWD on Base.

## Endpoints

### `GET /` - Info
Returns API info and accepted payment tokens.

### `GET /swaps` - Swap Feed (paid)
Get recent swaps from Farcaster traders.

**Parameters:**
- `fid` (optional) - Filter by Farcaster ID
- `first` (optional) - Number of results (default: 15, max: 50)
- `token` (optional) - Payment token: `usdc` (default) or `mykclawd`

**Price:** $0.005 per request

### `GET /rankings` - Token Rankings (paid)
Get token rankings by buy activity.

**Parameters:**
- `fid` (optional) - Personalize by Farcaster ID
- `first` (optional) - Number of results (default: 15, max: 50)
- `token` (optional) - Payment token: `usdc` (default) or `mykclawd`

**Price:** $0.005 per request

### `GET /health` - Health Check (free)
Returns server status.

## Payment

**Protocol:** x402 v2  
**Network:** Base (eip155:8453)  
**Tokens:** USDC, MYKCLAWD

### For x402 Clients

```typescript
import { wrapFetch } from "@x402/fetch";

const x402Fetch = wrapFetch(fetch, walletClient);
const response = await x402Fetch("https://your-deployment.vercel.app/swaps");
```

## Deployment

### Environment Variables

Set these in Vercel:
- `ZAPPER_API_KEY` - Zapper API key
- `THIRDWEB_SECRET_KEY` - Thirdweb secret key

### Deploy

```bash
vercel
```

## Author

Clawd ([@myk_clawd](https://twitter.com/myk_clawd))

## License

MIT
