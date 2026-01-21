import { useState, useEffect, CSSProperties } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0x0c78e01d2569757cfcdfda3ace5e81227c77145c254f12f21da825a243638f2b"; 
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

function App() {
  const { account, connected, wallets, connect, disconnect, signAndSubmitTransaction } = useWallet();
  const [view, setView] = useState<"issuer" | "investor">("issuer");
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
    } catch (e) { setInvoices([]); }
  };

  useEffect(() => { if (connected) fetchInvoices(); }, [account, connected]);

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
    } catch (e) { console.error(e); } finally { setIsMinting(false); }
  };

  const filteredInvoices = invoices.filter(inv => inv.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalValue = invoices.reduce((acc, inv) => acc + parseInt(inv.amount), 0);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.025em" }}>INVOICE.OS</h1>
          <div style={tabContainerStyle}>
            <button onClick={() => setView("issuer")} style={view === "issuer" ? activeTabStyle : tabStyle}>Issuer</button>
            <button onClick={() => setView("investor")} style={view === "investor" ? activeTabStyle : tabStyle}>Investor</button>
          </div>
        </div>
        {connected && (
          <div style={walletInfoStyle}>
            <div style={{ textAlign: "right", marginRight: "1.5rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase" }}>{view === "issuer" ? "Receivables" : "Allocated"}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#000" }}>${totalValue.toLocaleString()}</div>
            </div>
            <button onClick={disconnect} style={logoutButtonStyle}>Disconnect</button>
          </div>
        )}
      </header>

      <main style={mainContentStyle}>
        {!connected ? (
          <div style={heroCardStyle}>
            <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "2rem" }}>Institutional Gateway</h2>
            <div style={{ display: "grid", gap: "10px", maxWidth: "300px", margin: "0 auto" }}>
              {wallets.map((w) => (
                <button key={w.name} onClick={() => connect(w.name)} style={buttonStyle}>Connect {w.name}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {view === "issuer" ? (
              <section style={actionCardStyle}>
                <h3 style={sectionTitleStyle}>Asset Issuance</h3>
                <div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>Face Value (USD)</label>
                  <input type="number" value={customAmount} onChange={(e) => setCustomAmount(Number(e.target.value))} style={amountInputStyle} /></div>
                  <button onClick={mintInvoice} disabled={isMinting} style={mintButtonStyle}>{isMinting ? "Minting..." : "Mint Asset"}</button>
                </div>
              </section>
            ) : (
              <section style={actionCardStyle}>
                <h3 style={sectionTitleStyle}>Investment Terminal</h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0" }}>Deploy capital into verified receivables. Average Yield: 12.4% APR</p>
              </section>
            )}

            <input placeholder="Filter Assets..." style={searchInputStyle} onChange={(e) => setSearchTerm(e.target.value)} />

            <div style={gridStyle}>
              {filteredInvoices.map((inv, i) => (
                <div key={i} style={invoiceCardStyle}>
                  <div style={badgeStyle}>VERIFIED RWA</div>
                  <div style={{ margin: "12px 0", fontWeight: 700, fontSize: "1rem" }}>{inv.id}</div>
                  <div style={priceContainerStyle}>
                    <span style={{ fontWeight: 700 }}>${parseInt(inv.amount).toLocaleString()}</span>
                    {view === "investor" ? (
                      <button style={investButtonStyle} onClick={() => alert(`Investing in ${inv.id}`)}>Fund Asset</button>
                    ) : (
                      <span style={statusTagStyle}>• UNPAID</span>
                    )}
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

// STYLES (Added Tab & Investor UI)
const SYSTEM_FONTS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const containerStyle: CSSProperties = { backgroundColor: "#ffffff", color: "#000", minHeight: "100vh", fontFamily: SYSTEM_FONTS };
const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 10%", borderBottom: "1px solid #f1f5f9" };
const tabContainerStyle: CSSProperties = { display: "flex", gap: "10px", marginTop: "10px" };
const tabStyle: CSSProperties = { background: "none", border: "none", padding: "5px 10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: "#64748b" };
const activeTabStyle: CSSProperties = { ...tabStyle, color: "#000", borderBottom: "2px solid #000" };
const mainContentStyle: CSSProperties = { padding: "3rem 10%", maxWidth: "1100px", margin: "0 auto" };
const heroCardStyle: CSSProperties = { backgroundColor: "#f8fafc", padding: "4rem 2rem", borderRadius: "1.5rem", textAlign: "center", border: "1px solid #e2e8f0" };
const actionCardStyle: CSSProperties = { backgroundColor: "#ffffff", padding: "2rem", borderRadius: "1rem", marginBottom: "2.5rem", border: "1px solid #e2e8f0" };
const sectionTitleStyle: CSSProperties = { margin: "0 0 15px 0", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" };
const amountInputStyle: CSSProperties = { padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", width: "100%", fontWeight: 600 };
const mintButtonStyle: CSSProperties = { padding: "0.75rem 1.5rem", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700 };
const investButtonStyle: CSSProperties = { padding: "5px 12px", backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "0.4rem", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 };
const searchInputStyle: CSSProperties = { width: "100%", padding: "1rem", borderRadius: "0.75rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "2rem" };
const gridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" };
const invoiceCardStyle: CSSProperties = { backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #e2e8f0" };
const badgeStyle: CSSProperties = { fontSize: "0.6rem", fontWeight: 800, color: "#3b82f6", backgroundColor: "#eff6ff", padding: "4px 8px", borderRadius: "9999px", width: "fit-content" };
const priceContainerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" };
const statusTagStyle: CSSProperties = { fontSize: "0.65rem", fontWeight: 700, color: "#64748b" };
const walletInfoStyle: CSSProperties = { display: "flex", alignItems: "center" };
const logoutButtonStyle: CSSProperties = { backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#64748b", padding: "6px 12px", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 };
const labelStyle: CSSProperties = { display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: "8px" };
const buttonStyle: CSSProperties = { padding: "1rem", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 600 };

export default App;