const ZAPPER_API = 'https://public.zapper.xyz/graphql';

export async function zapperQuery(query, variables = {}) {
  const apiKey = process.env.ZAPPER_API_KEY;
  if (!apiKey) {
    throw new Error('ZAPPER_API_KEY not configured');
  }
  
  const response = await fetch(ZAPPER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-zapper-api-key': apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  
  if (!response.ok) {
    throw new Error(`Zapper API error: ${response.status}`);
  }
  
  return response.json();
}
