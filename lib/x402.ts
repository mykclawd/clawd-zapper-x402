import { createThirdwebClient } from 'thirdweb';
import { facilitator, settlePayment } from 'thirdweb/x402';
import { base } from 'thirdweb/chains';
import { NextRequest } from 'next/server';

// Configuration
const PAY_TO = '0xcef6e6639e0c60d5c0805670f4363a6698081fab';
const PRICE_USD = '$0.005';

// Initialize Thirdweb client
const thirdwebClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

// Initialize facilitator
const thirdwebFacilitator = facilitator({
  client: thirdwebClient,
  serverWalletAddress: PAY_TO,
});

export interface PaymentResult {
  status: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
}

export async function handleX402Payment(
  request: NextRequest,
  resourceUrl: string
): Promise<PaymentResult> {
  const paymentData =
    request.headers.get('payment-signature') ||
    request.headers.get('x-payment');

  const result = await settlePayment({
    resourceUrl,
    method: 'GET',
    paymentData,
    payTo: PAY_TO,
    network: base,
    price: PRICE_USD,
    facilitator: thirdwebFacilitator,
  });

  return result;
}

export { PAY_TO, PRICE_USD };
