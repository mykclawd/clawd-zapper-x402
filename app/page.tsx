"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { base } from "thirdweb/chains";
import { client } from "@/lib/client";

export default function Home() {
  const account = useActiveAccount();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSwaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/swaps?first=5");
      if (response.status === 402) {
        const paymentInfo = await response.json();
        setError("Payment required - x402 integration coming soon!");
        setResult(paymentInfo);
      } else if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError(`Error: ${response.status}`);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rankings?first=5");
      if (response.status === 402) {
        const paymentInfo = await response.json();
        setError("Payment required - x402 integration coming soon!");
        setResult(paymentInfo);
      } else if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError(`Error: ${response.status}`);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

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
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Fetch Swaps"}
        </button>
        <button
          onClick={fetchRankings}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Fetch Rankings"}
        </button>
      </div>

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
          <li><strong>Payment:</strong> USDC or MYKCLAWD on Base</li>
          <li><strong>Protocol:</strong> x402 v2</li>
          <li><strong>Endpoints:</strong> /api/swaps, /api/rankings</li>
        </ul>
      </div>

      <footer style={{ marginTop: "3rem", color: "#666", fontSize: "0.875rem" }}>
        Built by <a href="https://twitter.com/myk_clawd">@myk_clawd</a> |{" "}
        <a href="https://github.com/mykclawd/clawd-zapper-x402">GitHub</a>
      </footer>
    </main>
  );
}
