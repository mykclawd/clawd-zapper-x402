import { createThirdwebClient } from 'thirdweb';
import { settlePayment, facilitator } from 'thirdweb/x402';
import { base } from 'thirdweb/chains';
import { CONFIG, getPrice } from './config.js';

let thirdwebClient = null;
let thirdwebFacilitator = null;

function initThirdweb() {
  if (!thirdwebClient) {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    if (!secretKey) {
      throw new Error('THIRDWEB_SECRET_KEY not configured');
    }
    
    thirdwebClient = createThirdwebClient({ secretKey });
    thirdwebFacilitator = facilitator({
      client: thirdwebClient,
      serverWalletAddress: CONFIG.payTo,
    });
  }
  return { client: thirdwebClient, facilitator: thirdwebFacilitator };
}

export async function handleX402Payment(req, handler) {
  const { facilitator: thirdwebFacilitator } = initThirdweb();
  
  const url = new URL(req.url);
  const resourceUrl = url.toString();
  const method = req.method;
  const paymentData = req.headers.get('payment-signature') || req.headers.get('x-payment');
  const tokenParam = url.searchParams.get('token');
  
  try {
    const { token, price } = await getPrice(tokenParam);
    
    const result = await settlePayment({
      resourceUrl,
      method,
      paymentData,
      payTo: CONFIG.payTo,
      network: base,
      price,
      facilitator: thirdwebFacilitator,
      routeConfig: {
        description: `Zapper API access (${token.toUpperCase()})`,
        mimeType: 'application/json',
        maxTimeoutSeconds: 3600,
      },
    });
    
    if (result.status === 200) {
      const data = await handler(url.searchParams);
      
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      
      for (const [key, value] of Object.entries(result.responseHeaders || {})) {
        headers.set(key, value);
      }
      
      return new Response(JSON.stringify(data), { status: 200, headers });
    } else {
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      
      for (const [key, value] of Object.entries(result.responseHeaders || {})) {
        headers.set(key, value);
      }
      
      return new Response(JSON.stringify(result.responseBody), { 
        status: result.status, 
        headers 
      });
    }
  } catch (error) {
    console.error('x402 payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed', message: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
}
