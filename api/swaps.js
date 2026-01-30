import { handleX402Payment } from '../lib/x402.js';
import { zapperQuery } from '../lib/zapper.js';

export const config = {
  runtime: 'edge',
};

async function getSwaps(params) {
  const fid = params.get('fid') ? parseInt(params.get('fid')) : null;
  const first = Math.min(parseInt(params.get('first')) || 15, 50);
  
  const variables = { first };
  if (fid) variables.fid = fid;
  
  const query = `
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
  
  const result = await zapperQuery(query, variables);
  
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
  
  return handleX402Payment(req, getSwaps);
}
