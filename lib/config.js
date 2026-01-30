// Configuration
export const CONFIG = {
  // Clawd's Bankr wallet
  payTo: '0xcef6e6639e0c60d5c0805670f4363a6698081fab',
  
  // Network - Base mainnet
  network: 'base',
  chainId: 8453,
  
  // Tokens on Base
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
  
  // Pricing
  priceUsd: '0.005', // $0.005 per request
};

// Cache for mykclawd price (refresh every 5 minutes)
let mykclawdPriceCache = { price: null, timestamp: 0 };
const PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getMykclawdPrice() {
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
    console.warn('Failed to fetch mykclawd price:', e.message);
  }
  
  return mykclawdPriceCache.price || 0.0000005;
}

export async function getMykclawdAmount(usdPrice) {
  const tokenPrice = await getMykclawdPrice();
  const tokenAmount = parseFloat(usdPrice) / tokenPrice;
  return BigInt(Math.ceil(tokenAmount * 1e18)).toString();
}

export async function getPrice(tokenParam) {
  const token = (tokenParam || 'usdc').toLowerCase();
  
  if (token === 'mykclawd') {
    const amount = await getMykclawdAmount(CONFIG.priceUsd);
    return {
      token: 'mykclawd',
      price: {
        amount,
        asset: {
          address: CONFIG.tokens.mykclawd.address,
          decimals: CONFIG.tokens.mykclawd.decimals,
        },
      },
    };
  }
  
  return {
    token: 'usdc',
    price: `$${CONFIG.priceUsd}`,
  };
}
