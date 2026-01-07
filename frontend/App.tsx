import React, { useState, useEffect, CSSProperties } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// 1. CONFIGURATION
const MODULE_ADDRESS = "0x0c78e01d2569757cfcdfda3ace5e81227c77145c254f12f21da825a243638f2b"; 
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

function App() {
  const { account, connected, wallets, connect, disconnect, signAndSubmitTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  // 2. FETCH DATA FROM BLOCKCHAIN
  const fetchInvoices = async () => {
    if (!account) return;
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::invoice_rwa::InvoiceStore`,
      });
      setInvoices((resource as any).invoices);
    } catch (e) {
      console.log("No invoices found yet. Mint one to create the store!");
      setInvoices([]);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchInvoices();
    }
  }, [account, connected]);

  // 3. MINT FUNCTION
  const mintInvoice = async () => {
    if (!account) return;
    setIsMinting(true);
    
    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::invoice_rwa::create_invoice`,
        functionArguments: ["INV-" + Math.floor(Math.random() * 1000), 500],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      await fetchInvoices(); // Refresh list automatically
      alert("Success! Invoice stored on Aptos.");
    } catch (e) {
      console.error("Minting error:", e);
    } finally {
      setIsMinting(false);
    }
  };

  // 4. RENDER UI
  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>RWA Invoice Dashboard</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Aptos Testnet Real-World Asset Management</p>

      {!connected ? (
        <div style={cardStyle}>
          <h3>Connect your wallet to begin</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
            {wallets.map((wallet) => (
              <button key={wallet.name} onClick={() => connect(wallet.name)} style={buttonStyle}>
                Connect {wallet.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <div style={accountInfoStyle}>
            <span>Connected: <strong>{account?.address.toString().slice(0, 6)}...</strong></span>
            <button onClick={disconnect} style={logoutButtonStyle}>Disconnect</button>
          </div>

          <button 
            onClick={mintInvoice} 
            disabled={isMinting} 
            style={{ ...buttonStyle, backgroundColor: "#10b981", width: "100%", fontSize: "1.2rem", padding: "1.5rem" }}
          >
            {isMinting ? "⛓️ Processing On-Chain..." : "➕ Mint New Invoice ($500)"}
          </button>

          <h2 style={{ marginTop: "3rem", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>Your Assets</h2>
          
          <div style={listContainerStyle}>
            {invoices.length === 0 ? (
              <p style={{ color: "#64748b", marginTop: "20px" }}>No assets found on this account.</p>
            ) : (
              invoices.map((inv, index) => (
                <div key={index} style={invoiceCardStyle}>
                  <div>
                    <div style={{ color: "#3b82f6", fontSize: "0.8rem", fontWeight: "bold" }}>INVOICE ID</div>
                    <div style={{ fontSize: "1.1rem" }}>{inv.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: "bold" }}>VALUE</div>
                    <div style={{ fontSize: "1.1rem" }}>${inv.amount}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 5. STYLES (Fixed TypeScript types)
const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "4rem 2rem",
  backgroundColor: "#0f172a",
  color: "white",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif"
};

const cardStyle: CSSProperties = {
  backgroundColor: "#1e293b",
  padding: "2rem",
  borderRadius: "1rem",
  border: "1px solid #334155",
  textAlign: "center",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
};

const buttonStyle: CSSProperties = {
  padding: "0.8rem 1.5rem",
  cursor: "pointer",
  backgroundColor: "#3b82f6",
  border: "none",
  color: "white",
  borderRadius: "0.5rem",
  fontWeight: "bold",
  transition: "all 0.2s"
};

const logoutButtonStyle: CSSProperties = {
  backgroundColor: "transparent",
  color: "#f87171",
  border: "1px solid #f87171",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem"
};

const accountInfoStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#1e293b",
  padding: "1rem",
  borderRadius: "0.5rem",
  marginBottom: "1.5rem",
  fontSize: "0.9rem"
};

const listContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "1.5rem",
  width: "100%"
};

const invoiceCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#1e293b",
  padding: "1.2rem",
  borderRadius: "0.75rem",
  borderLeft: "4px solid #3b82f6",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
};

export default App;
