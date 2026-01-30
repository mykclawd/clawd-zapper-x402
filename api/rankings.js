import { handleX402Payment } from '../lib/x402.js';
import { zapperQuery } from '../lib/zapper.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

async function getRankings(query) {
  const fid = query.fid ? parseInt(query.fid) : null;
  const first = Math.min(parseInt(query.first) || 15, 50);
  
  const variables = { first };
  if (fid) variables.fid = fid;
  
  const gqlQuery = `
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
  
  const result = await zapperQuery(gqlQuery, variables);
  
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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Payment-Signature');
    return res.status(204).end();
  }
  
  return handleX402Payment(req, res, getRankings);
}
