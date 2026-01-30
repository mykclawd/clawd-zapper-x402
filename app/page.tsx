"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { base } from "thirdweb/chains";
import { client } from "@/lib/client";
import { x402Fetch } from "thirdweb/x402";

export default function Home() {
  const account = useActiveAccount();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const fetchWithPayment = async (endpoint: string) => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentInfo(null);

    try {
      // Use x402Fetch which automatically handles payment
      const response = await x402Fetch(`/api/${endpoint}?first=5`, {
        client,
        wallet: account,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else if (response.status === 402) {
        // Payment header available for display
        const paymentHeader = response.headers.get("payment-required");
        if (paymentHeader) {
          try {
            const decoded = JSON.parse(atob(paymentHeader));
            setPaymentInfo(decoded);
            setError("Payment required - check details below");
          } catch {
            setError("Payment required");
          }
        }
      } else {
        setError(`Error: ${response.status}`);
      }
    } catch (e: any) {
      // If payment was made but something failed
      if (e.message?.includes("payment")) {
        setError(`Payment error: ${e.message}`);
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const fetchSwaps = () => fetchWithPayment("swaps");
  const fetchRankings = () => fetchWithPayment("rankings");

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>🐾 Clawd Zapper API</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        Zapper swap feed via x402 micropayments
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <ConnectButton
          client={client}
          chain={base}
          connectButton={{ label: "Connect Wallet" }}
        />
      </div>

      {account && (
        <p style={{ color: "#7c3aed", marginBottom: "1rem" }}>
          Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={fetchSwaps}
          disabled={loading || !account}
          style={{
            padding: "0.75rem 1.5rem",
            background: account ? "#7c3aed" : "#444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !account ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Fetch Swaps ($0.005)"}
        </button>
        <button
          onClick={fetchRankings}
          disabled={loading || !account}
          style={{
            padding: "0.75rem 1.5rem",
            background: account ? "#7c3aed" : "#444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading || !account ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Fetch Rankings ($0.005)"}
        </button>
      </div>

      {!account && (
        <p style={{ color: "#f59e0b", marginBottom: "1rem" }}>
          ⚠️ Connect your wallet to make paid API requests
        </p>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#1a1a2e",
            borderRadius: "8px",
            marginBottom: "1rem",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <p style={{ color: "#f59e0b" }}>{error}</p>
        </div>
      )}

      {paymentInfo && (
        <div
          style={{
            padding: "1rem",
            background: "#1a1a2e",
            borderRadius: "8px",
            marginBottom: "1rem",
            borderLeft: "4px solid #7c3aed",
          }}
        >
          <h3 style={{ color: "#7c3aed", marginBottom: "0.5rem" }}>Payment Details</h3>
          <p style={{ color: "#888", fontSize: "0.875rem" }}>
            Network: {paymentInfo.accepts?.[0]?.network}<br/>
            Amount: {(parseInt(paymentInfo.accepts?.[0]?.maxAmountRequired || "0") / 1e6).toFixed(4)} USDC<br/>
            Pay To: {paymentInfo.accepts?.[0]?.payTo?.slice(0, 10)}...
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            padding: "1rem",
            background: "#1a1a2e",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          <pre style={{ fontSize: "0.875rem" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: "3rem", borderTop: "1px solid #333", paddingTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>API Info</h2>
        <ul style={{ color: "#888", lineHeight: "1.8" }}>
          <li><strong>Price:</strong> $0.005 per request</li>
          <li><strong>Payment:</strong> USDC on Base via x402</li>
          <li><strong>Protocol:</strong> x402 v2 (Thirdweb)</li>
          <li><strong>Endpoints:</strong> /api/swaps, /api/rankings</li>
        </ul>
      </div>

      <footer style={{ marginTop: "3rem", color: "#666", fontSize: "0.875rem" }}>
        Built by <a href="https://twitter.com/myk_clawd" style={{ color: "#7c3aed" }}>@myk_clawd</a> |{" "}
        <a href="https://github.com/mykclawd/clawd-zapper-x402" style={{ color: "#7c3aed" }}>GitHub</a>
      </footer>
    </main>
  );
}
