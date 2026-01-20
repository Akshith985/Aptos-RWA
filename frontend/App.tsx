import { useState, useEffect } from "react";
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
    // Uses your --background variable
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-[8%] py-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Invoice Protocol</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secure RWA Tokenization</p>
        </div>
        
        {connected && (
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portfolio Value</p>
              <p className="text-xl font-bold text-primary">${totalValue.toLocaleString()}</p>
            </div>
            <button 
              onClick={disconnect} 
              className="px-5 py-2 border border-destructive/20 text-destructive text-xs font-bold rounded-full hover:bg-destructive/10 transition-all active:scale-95"
            >
              Disconnect
            </button>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!connected ? (
          <div className="bg-card border border-border p-16 rounded-[2.5rem] shadow-sm text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Connect to Mint Assets</h2>
            <div className="flex flex-col gap-3 max-w-xs mx-auto mt-8">
              {wallets.map((w) => (
                <button 
                  key={w.name} 
                  onClick={() => connect(w.name)} 
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Connect {w.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ISSUE SECTION */}
            <section className="bg-card border border-border p-10 rounded-[2.5rem] shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2">Issue New Invoice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Mint a unique Move resource to represent your accounts receivable on the Aptos network.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/50 p-4 rounded-3xl border border-border">
                <div className="px-4">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    value={customAmount} 
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="bg-transparent text-2xl font-bold w-28 outline-none"
                  />
                </div>
                <button 
                  onClick={mintInvoice} 
                  disabled={isMinting} 
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold text-sm hover:opacity-90 disabled:bg-muted transition-all active:scale-95"
                >
                  {isMinting ? "MINTING..." : "MINT ASSET"}
                </button>
              </div>
            </section>

            {/* SEARCH */}
            <input 
              placeholder="Search Assets by ID..." 
              className="w-full bg-card border border-border px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/5 transition-all text-sm mb-10"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* GRID SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInvoices.map((inv, i) => (
                <div 
                  key={i} 
                  className="group premium-card-transition relative bg-card border border-border p-8 rounded-[2rem] shadow-sm hover:bg-foreground hover:text-background hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-bold tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded group-hover:bg-background/10 group-hover:text-blue-200">
                      RWA-ASSET
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-background/50">
                      UNPAID
                    </span>
                  </div>
                  
                  <h4 className="text-[10px] font-bold text-muted-foreground mb-1 group-hover:text-background/40 uppercase tracking-widest">
                    Asset Identifier
                  </h4>
                  <div className="text-xl font-bold mb-6">
                    {inv.id}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border group-hover:border-background/10">
                    <span className="text-3xl font-bold">
                      ${parseInt(inv.amount).toLocaleString()}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center group-hover:bg-background group-hover:text-foreground transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </svg>
                    </div>
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

export default App;
