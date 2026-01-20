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

  // LOGIC: Fetch Invoices
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

  // LOGIC: Mint Invoice
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
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* PREMIUM HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-[8%] py-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black">Invoice Protocol</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure RWA Tokenization</p>
        </div>
        
        {connected && (
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Portfolio Value</p>
              <p className="text-xl font-bold text-black">${totalValue.toLocaleString()}</p>
            </div>
            <button 
              onClick={disconnect} 
              className="px-5 py-2 border border-red-100 text-red-500 text-xs font-bold rounded-full hover:bg-red-50 transition-all active:scale-95"
            >
              Disconnect
            </button>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!connected ? (
          <div className="bg-white border border-gray-100 p-16 rounded-[2.5rem] shadow-sm text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Institutional Trade Finance</h2>
            <p className="text-gray-400 mb-10 text-lg">Connect your wallet to begin minting secure Move-native RWA assets.</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {wallets.map((w) => (
                <button 
                  key={w.name} 
                  onClick={() => connect(w.name)} 
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  Connect {w.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ISSUE SECTION */}
            <section className="bg-white border border-gray-100 p-10 rounded-[2rem] shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md text-center md:text-left">
                <h3 className="text-xl font-bold mb-2 text-black">Issue New Asset</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Tokenize your accounts receivable into unique, non-duplicable Move resources on the Aptos network.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                <div className="px-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    value={customAmount} 
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="bg-transparent text-2xl font-bold w-28 outline-none text-black"
                  />
                </div>
                <button 
                  onClick={mintInvoice} 
                  disabled={isMinting} 
                  className="bg-black text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 disabled:bg-gray-300 transition-all active:scale-95 shadow-lg shadow-black/5"
                >
                  {isMinting ? "MINTING..." : "MINT ASSET"}
                </button>
              </div>
            </section>

            {/* SEARCH */}
            <div className="relative mb-10">
              <input 
                placeholder="Search Assets by ID..." 
                className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* GRID SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInvoices.map((inv, i) => (
                <div 
                  key={i} 
                  className="group relative bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm transition-all duration-500 hover:bg-black hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-blue-500 bg-blue-50 px-2 py-1 rounded-md group-hover:bg-white/10 group-hover:text-blue-300 transition-colors">
                      RWA-ASSET
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-500">
                      UNPAID
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-gray-400 mb-1 group-hover:text-gray-500 uppercase tracking-widest">
                    Asset Identifier
                  </h4>
                  <div className="text-xl font-bold text-black group-hover:text-white transition-colors mb-6">
                    {inv.id}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 group-hover:border-white/10 transition-colors">
                    <span className="text-3xl font-bold text-black group-hover:text-white transition-colors">
                      ${parseInt(inv.amount).toLocaleString()}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
