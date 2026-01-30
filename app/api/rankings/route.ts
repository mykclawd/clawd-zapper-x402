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
    
    const rankings = result.data?.tokenRanking?.edges?.map((edge: any) => ({
      symbol: edge.node.token.symbol,
      name: edge.node.token.name,
      address: edge.node.tokenAddress,
      chainId: edge.node.chainId,
      buyCount: edge.node.buyCount,
      buyerCount: edge.node.buyerCount,
      buyerCount24h: edge.node.buyerCount24h,
      price: edge.node.token.priceData?.price,
    })) || [];
    
    return NextResponse.json({ rankings, count: rankings.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch rankings', message: error.message },
      { status: 500 }
    );
  }
}
