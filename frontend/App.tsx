import { useState, useEffect, CSSProperties } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

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
      console.log("No invoices found yet.");
      setInvoices([]);
    }
  };

  useEffect(() => {
    if (connected) fetchInvoices();
  }, [account, connected]);

  // 3. MINT FUNCTION
  const mintInvoice = async () => {
    if (!account) return;
    setIsMinting(true);
    
    const randomId = "INV-" + Math.floor(Math.random() * 9000 + 1000);
    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::invoice_rwa::create_invoice`,
        functionArguments: [randomId, 500],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      await fetchInvoices();
    } catch (e) {
      console.error("Minting error:", e);
    } finally {
      setIsMinting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. RENDER UI
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#f8fafc" }}>Invoice Protocol</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>RWA Asset Management on Aptos</p>
        </div>
        {connected && (
          <div style={walletInfoStyle}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{account?.address.toString().slice(0, 8)}...</span>
            <button onClick={disconnect} style={logoutButtonStyle}>Disconnect</button>
          </div>
        )}
      </header>

      <main style={mainContentStyle}>
        {!connected ? (
          <div style={heroCardStyle}>
            <h2 style={{ marginBottom: "1rem" }}>Tokenize Business Debt</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>Connect your wallet to mint and manage Real-World Assets.</p>
            <div style={{ display: "grid", gap: "12px" }}>
              {wallets.map((wallet) => (
                <button key={wallet.name} onClick={() => connect(wallet.name)} style={buttonStyle}>
                  Connect {wallet.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <section style={actionCardStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Issue New Invoice</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Instant on-chain minting of account receivables.</p>
              </div>
              <button 
                onClick={mintInvoice} 
                disabled={isMinting} 
                style={{ ...mintButtonStyle, opacity: isMinting ? 0.6 : 1 }}
              >
                {isMinting ? "Processing..." : "Mint $500 Invoice"}
              </button>
            </section>

            <div style={searchContainerStyle}>
              <input 
                type="text" 
                placeholder="Search Invoice ID..." 
                style={searchInputStyle}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <h3 style={{ marginBottom: "1rem", color: "#cbd5e1" }}>Active Assets ({filteredInvoices.length})</h3>
            <div style={gridStyle}>
              {filteredInvoices.length === 0 ? (
                <div style={emptyStateStyle}>No active invoices found.</div>
              ) : (
                filteredInvoices.map((inv, index) => (
                  <div key={index} style={invoiceCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <span style={badgeStyle}>VERIFIED RWA</span>
                      <a 
                        href={`https://explorer.aptoslabs.com/account/${account?.address}?network=testnet`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={explorerLinkStyle}
                      >
                        View on Explorer ↗
                      </a>
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.2rem" }}>{inv.id}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Aptos Object Asset</div>
                    
                    <div style={priceContainerStyle}>
                      <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "#10b981" }}>${inv.amount}</span>
                      <span style={statusTagStyle}>PENDING FUNDING</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// 5. STYLES (Professional Dark Theme)
const containerStyle: CSSProperties = {
  backgroundColor: "#020617",
  color: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.5rem 10%",
  borderBottom: "1px solid #1e293b",
  backgroundColor: "#020617",
};

const mainContentStyle: CSSProperties = {
  padding: "3rem 10%",
  maxWidth: "1200px",
  margin: "0 auto",
};

const heroCardStyle: CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "3rem",
  borderRadius: "1.5rem",
  textAlign: "center",
  border: "1px solid #1e293b",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
};

const actionCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#1e293b",
  padding: "1.5rem",
  borderRadius: "1rem",
  marginBottom: "2rem",
  border: "1px solid #334155",
};

const invoiceCardStyle: CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "1.5rem",
  borderRadius: "1rem",
  border: "1px solid #1e293b",
  transition: "transform 0.2s, border-color 0.2s",
  cursor: "default",
};

const buttonStyle: CSSProperties = {
  padding: "1rem",
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "0.75rem",
  fontWeight: "bold",
  cursor: "pointer",
};

const mintButtonStyle: CSSProperties = {
  padding: "0.8rem 1.5rem",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  fontWeight: "600",
  cursor: "pointer",
};

const searchInputStyle: CSSProperties = {
  width: "100%",
  padding: "1rem",
  borderRadius: "0.75rem",
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  color: "white",
  marginBottom: "2rem",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.5rem",
};

const badgeStyle: CSSProperties = {
  fontSize: "0.7rem",
  backgroundColor: "rgba(59, 130, 246, 0.1)",
  color: "#3b82f6",
  padding: "4px 8px",
  borderRadius: "4px",
  fontWeight: "bold",
};

const statusTagStyle: CSSProperties = {
  fontSize: "0.7rem",
  backgroundColor: "#334155",
  color: "#94a3b8",
  padding: "4px 8px",
  borderRadius: "4px",
  fontWeight: "600",
};

const explorerLinkStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  textDecoration: "none",
};

const priceContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #1e293b",
  paddingTop: "1rem",
};

const walletInfoStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  backgroundColor: "#0f172a",
  padding: "0.5rem 1rem",
  borderRadius: "2rem",
  border: "1px solid #1e293b",
};

const logoutButtonStyle: CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #f87171",
  color: "#f87171",
  fontSize: "0.7rem",
  padding: "2px 8px",
  borderRadius: "1rem",
  cursor: "pointer",
};

const searchContainerStyle: CSSProperties = {};
const emptyStateStyle: CSSProperties = { color: "#64748b" };

export default App;
