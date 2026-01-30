import { handleX402Payment } from '../lib/x402.js';
import { zapperQuery } from '../lib/zapper.js';

export const config = {
  runtime: 'edge',
};

async function getRankings(params) {
  const fid = params.get('fid') ? parseInt(params.get('fid')) : null;
  const first = Math.min(parseInt(params.get('first')) || 15, 50);
  
  const variables = { first };
  if (fid) variables.fid = fid;
  
  const query = `
    query TokenRanking($first: Int, $fid: Int) {
      tokenRanking(first: $first, fid: $fid) {
        edges {
          node {
            chainId
            tokenAddress
            token { symbol name priceData { price } }
            buyCount
            buyerCount
            buyerCount24h
          }
        }
      }
    }
  `;
  
  const result = await zapperQuery(query, variables);
  
  const rankings = result.data?.tokenRanking?.edges?.map(edge => ({
    symbol: edge.node.token.symbol,
    name: edge.node.token.name,
    address: edge.node.tokenAddress,
    chainId: edge.node.chainId,
    buyCount: edge.node.buyCount,
    buyerCount: edge.node.buyerCount,
    buyerCount24h: edge.node.buyerCount24h,
    price: edge.node.token.priceData?.price,
  })) || [];
  
  return { rankings, count: rankings.length };
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Payment, Payment-Signature',
      },
    });
  }
  
  return handleX402Payment(req, getRankings);
}
