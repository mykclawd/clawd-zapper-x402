import { createThirdwebClient } from "thirdweb";

// Client-side thirdweb client (uses client ID, not secret key)
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});
