import { NextRequest, NextResponse } from 'next/server';
import { zapperQuery } from '@/lib/zapper';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fid = searchParams.get('fid') ? parseInt(searchParams.get('fid')!) : null;
  const first = Math.min(parseInt(searchParams.get('first') || '15'), 50);
  
  try {
    const variables: Record<string, any> = { first };
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
    
    const swaps = result.data?.generalSwapFeed?.edges?.map((edge: any) => ({
      symbol: edge.node.swap.token.symbol,
      address: edge.node.swap.token.address,
      isBuy: edge.node.swap.isBuy,
      volumeUsd: edge.node.swap.volumeUsd,
      amount: edge.node.swap.amount,
      chainId: edge.node.swap.chainId,
      timestamp: edge.node.swap.timestamp,
      fid: edge.node.swap.profile?.fid,
    })) || [];
    
    return NextResponse.json({ swaps, count: swaps.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch swaps', message: error.message },
      { status: 500 }
    );
  }
}
