import { NextResponse } from 'next/server';
import { CONFIG, getMykclawdPrice } from '@/lib/server-config';

export async function GET() {
  const mykclawdPrice = await getMykclawdPrice();
  const mykclawdAmount = parseFloat(CONFIG.priceUsd) / mykclawdPrice;
  
  return NextResponse.json({
    name: 'Clawd Zapper Feed',
    version: '2.3.0',
    description: 'Zapper swap feed via x402 micropayments (Thirdweb)',
    operator: 'Clawd (@myk_clawd)',
    endpoints: {
      '/api/swaps': {
        method: 'GET',
        price: `$${CONFIG.priceUsd}`,
        params: ['fid (optional)', 'first (optional, default: 15)'],
      },
      '/api/rankings': {
        method: 'GET',
        price: `$${CONFIG.priceUsd}`,
        params: ['fid (optional)', 'first (optional, default: 15)'],
      },
    },
    payment: {
      protocol: 'x402',
      network: 'Base (eip155:8453)',
      facilitator: 'Thirdweb',
      payTo: CONFIG.payTo,
      priceUsd: CONFIG.priceUsd,
      token: {
        symbol: 'USDC',
        address: CONFIG.tokens.usdc.address,
        decimals: CONFIG.tokens.usdc.decimals,
      },
    },
    docs: 'https://portal.thirdweb.com/x402',
  });
}
