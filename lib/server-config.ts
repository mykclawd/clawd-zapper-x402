// Server-side configuration
export const CONFIG = {
  payTo: '0xcef6e6639e0c60d5c0805670f4363a6698081fab',
  chainId: 8453,
  tokens: {
    usdc: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    mykclawd: {
      address: '0x0f546aa8f97932e9a755c3f287b2532e4f06db07',
      decimals: 18,
      symbol: 'MYKCLAWD',
    },
  },
  priceUsd: '0.005',
};

// Cache for mykclawd price
let mykclawdPriceCache = { price: 0, timestamp: 0 };
const PRICE_CACHE_TTL = 5 * 60 * 1000;

export async function getMykclawdPrice(): Promise<number> {
  const now = Date.now();
  if (mykclawdPriceCache.price && now - mykclawdPriceCache.timestamp < PRICE_CACHE_TTL) {
    return mykclawdPriceCache.price;
  }
  
  try {
    const response = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/base/tokens/${CONFIG.tokens.mykclawd.address}`
    );
    const data = await response.json();
    const price = parseFloat(data.data?.attributes?.price_usd || '0');
    if (price > 0) {
      mykclawdPriceCache = { price, timestamp: now };
      return price;
    }
  } catch (e) {
    console.warn('Failed to fetch mykclawd price');
  }
  
  return mykclawdPriceCache.price || 0.0000005;
}
