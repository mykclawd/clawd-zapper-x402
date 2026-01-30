import { handleX402Payment } from '../lib/x402.js';
import { zapperQuery } from '../lib/zapper.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

async function getSwaps(query) {
  const fid = query.fid ? parseInt(query.fid) : null;
  const first = Math.min(parseInt(query.first) || 15, 50);
  
  const variables = { first };
  if (fid) variables.fid = fid;
  
  const gqlQuery = `
    query GeneralSwapFeed($first: Int, $fid: Int) {
      generalSwapFeed(first: $first, fid: $fid) {
        edges {
          node {
            swap {
              token { symbol address }
              isBuy
              volumeUsd
              amount
              chainId
              timestamp
              profile { fid }
            }
          }
        }
      }
    }
  `;
  
  const result = await zapperQuery(gqlQuery, variables);
  
  const swaps = result.data?.generalSwapFeed?.edges?.map(edge => ({
    symbol: edge.node.swap.token.symbol,
    address: edge.node.swap.token.address,
    isBuy: edge.node.swap.isBuy,
    volumeUsd: edge.node.swap.volumeUsd,
    amount: edge.node.swap.amount,
    chainId: edge.node.swap.chainId,
    timestamp: edge.node.swap.timestamp,
    fid: edge.node.swap.profile?.fid,
  })) || [];
  
  return { swaps, count: swaps.length };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Payment-Signature');
    return res.status(204).end();
  }
  
  return handleX402Payment(req, res, getSwaps);
}
