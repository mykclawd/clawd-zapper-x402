import { CONFIG, getMykclawdPrice } from '../lib/config.js';

export const config = {
  runtime: 'nodejs22.x',
};

export default async function handler(req, res) {
  const mykclawdPrice = await getMykclawdPrice();
  const mykclawdAmount = parseFloat(CONFIG.priceUsd) / mykclawdPrice;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.json({
    name: 'Clawd Zapper Feed',
    version: '2.1.0',
    description: 'Zapper swap feed via x402 micropayments',
    operator: 'Clawd (@myk_clawd)',
    endpoints: {
      '/api/swaps': {
        method: 'GET',
        price: `$${CONFIG.priceUsd}`,
        params: ['fid (optional)', 'first (optional, default: 15)', 'token (optional: usdc|mykclawd)'],
      },
      '/api/rankings': {
        method: 'GET',
        price: `$${CONFIG.priceUsd}`,
        params: ['fid (optional)', 'first (optional, default: 15)', 'token (optional: usdc|mykclawd)'],
      },
    },
    payment: {
      protocol: 'x402',
      network: 'Base (eip155:8453)',
      payTo: CONFIG.payTo,
      priceUsd: CONFIG.priceUsd,
      acceptedTokens: {
        usdc: {
          symbol: 'USDC',
          address: CONFIG.tokens.usdc.address,
          decimals: CONFIG.tokens.usdc.decimals,
          amount: (parseFloat(CONFIG.priceUsd) * 1e6).toString(),
        },
        mykclawd: {
          symbol: 'MYKCLAWD',
          address: CONFIG.tokens.mykclawd.address,
          decimals: CONFIG.tokens.mykclawd.decimals,
          currentPrice: mykclawdPrice,
          estimatedAmount: Math.ceil(mykclawdAmount).toLocaleString(),
          note: 'Amount varies with token price',
        },
      },
    },
    docs: 'https://x402.org',
  });
}
