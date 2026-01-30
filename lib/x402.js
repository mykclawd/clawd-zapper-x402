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

export async function handleX402Payment(req, res, handler) {
  const { facilitator: thirdwebFacilitator } = initThirdweb();
  
  // Build resource URL from request
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const resourceUrl = `${protocol}://${host}${req.url}`;
  const method = req.method;
  const paymentData = req.headers['payment-signature'] || req.headers['x-payment'];
  const tokenParam = req.query?.token;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'X-PAYMENT,X-PAYMENT-RESPONSE,PAYMENT-REQUIRED,PAYMENT-RESPONSE');
  
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
      const data = await handler(req.query);
      
      // Set payment response headers
      for (const [key, value] of Object.entries(result.responseHeaders || {})) {
        res.setHeader(key, value);
      }
      
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(data);
    } else {
      // Payment required - return 402
      for (const [key, value] of Object.entries(result.responseHeaders || {})) {
        res.setHeader(key, value);
      }
      
      res.setHeader('Content-Type', 'application/json');
      return res.status(result.status).json(result.responseBody);
    }
  } catch (error) {
    console.error('x402 payment error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Payment processing failed', message: error.message });
  }
}
