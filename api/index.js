import { CONFIG, getMykclawdPrice } from '../lib/config.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const mykclawdPrice = await getMykclawdPrice();
  const mykclawdAmount = parseFloat(CONFIG.priceUsd) / mykclawdPrice;
  
  const info = {
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
  };
  
  return new Response(JSON.stringify(info, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
