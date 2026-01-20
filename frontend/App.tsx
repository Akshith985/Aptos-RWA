import { useState, useEffect, CSSProperties } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// CONFIGURATION
const MODULE_ADDRESS = "0x0c78e01d2569757cfcdfda3ace5e81227c77145c254f12f21da825a243638f2b"; 
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

function App() {
  const { account, connected, wallets, connect, disconnect, signAndSubmitTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customAmount, setCustomAmount] = useState<number>(500);

  const fetchInvoices = async () => {
    if (!account) return;
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: account.address,
        resourceType: `${MODULE_ADDRESS}::invoice_rwa::InvoiceStore`,
      });
      setInvoices((resource as any).invoices);
    } catch (e) {
      setInvoices([]);
    }
  };

  useEffect(() => {
    if (connected) fetchInvoices();
  }, [account, connected]);

  const mintInvoice = async () => {
    if (!account) return;
    setIsMinting(true);
    
    const randomId = "INV-" + Math.floor(Math.random() * 9000 + 1000);
    const transaction: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::invoice_rwa::create_invoice`,
        functionArguments: [randomId, customAmount], 
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

  const totalValue = invoices.reduce((acc, inv) => acc + parseInt(inv.amount), 0);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Invoice Protocol</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.8rem" }}>Secure RWA Tokenization</p>
        </div>
        {connected && (
          <div style={walletInfoStyle}>
            <div style={{ textAlign: "right", marginRight: "1rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Portfolio Value</div>
              <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#10b981" }}>${totalValue}</div>
            </div>
            <button onClick={disconnect} style={logoutButtonStyle}>Disconnect</button>
          </div>
        )}
      </header>

      <main style={mainContentStyle}>
        {!connected ? (
          <div style={heroCardStyle}>
            <h2>Connect to Start Minting</h2>
            <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
              {wallets.map((w) => (
                <button key={w.name} onClick={() => connect(w.name)} style={buttonStyle}>Connect {w.name}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <section style={actionCardStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px 0" }}>Issue Invoice</h3>
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
                  <div>
                    <label style={labelStyle}>Amount ($)</label>
                    <input 
                      type="number" 
                      value={customAmount} 
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      style={amountInputStyle}
                    />
                  </div>
                  <button onClick={mintInvoice} disabled={isMinting} style={mintButtonStyle}>
                    {isMinting ? "Minting..." : "Mint Asset"}
                  </button>
                </div>
              </div>
            </section>

            <input 
              placeholder="Search by ID..." 
              style={searchInputStyle} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div style={gridStyle}>
              {filteredInvoices.map((inv, i) => (
                <div key={i} style={invoiceCardStyle}>
                  <div style={badgeStyle}>RWA-ASSET</div>
                  <div style={{ margin: "10px 0", fontWeight: "bold" }}>{inv.id}</div>
                  <div style={priceContainerStyle}>
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>${inv.amount}</span>
                    <span style={statusTagStyle}>UNPAID</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// STYLES
const containerStyle: CSSProperties = { backgroundColor: "#020617", color: "white", minHeight: "100vh", fontFamily: "sans-serif" };
const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", padding: "1rem 10%", borderBottom: "1px solid #1e293b" };
const mainContentStyle: CSSProperties = { padding: "2rem 10%", maxWidth: "1000px", margin: "0 auto" };
const heroCardStyle: CSSProperties = { backgroundColor: "#0f172a", padding: "3rem", borderRadius: "1rem", textAlign: "center", border: "1px solid #1e293b" };
const actionCardStyle: CSSProperties = { backgroundColor: "#1e293b", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem" };
const amountInputStyle: CSSProperties = { padding: "0.5rem", borderRadius: "0.4rem", border: "1px solid #334155", backgroundColor: "#020617", color: "white", width: "100px" };
const mintButtonStyle: CSSProperties = { padding: "0.6rem 1.2rem", backgroundColor: "#10b981", border: "none", color: "white", borderRadius: "0.4rem", cursor: "pointer", fontWeight: "bold" };
const searchInputStyle: CSSProperties = { width: "100%", padding: "0.8rem", borderRadius: "0.5rem", backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "white", marginBottom: "1.5rem" };
const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" };
const invoiceCardStyle: CSSProperties = { backgroundColor: "#0f172a", padding: "1rem", borderRadius: "0.8rem", border: "1px solid #1e293b" };
const badgeStyle: CSSProperties = { fontSize: "0.6rem", color: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", padding: "2px 6px", borderRadius: "4px", width: "fit-content" };
const priceContainerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #1e293b" };
const statusTagStyle: CSSProperties = { fontSize: "0.7rem", color: "#94a3b8" };
const walletInfoStyle: CSSProperties = { display: "flex", alignItems: "center" };
const logoutButtonStyle: CSSProperties = { backgroundColor: "transparent", border: "1px solid #f87171", color: "#f87171", padding: "4px 10px", borderRadius: "1rem", cursor: "pointer", fontSize: "0.7rem" };
const labelStyle: CSSProperties = { display: "block", fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" };
const buttonStyle: CSSProperties = { padding: "0.8rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" };

export default App;
