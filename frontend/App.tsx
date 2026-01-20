import { useState, useEffect } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

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
    } catch (e) { console.error(e); } finally { setIsMinting(false); }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = invoices.reduce((acc, inv) => acc + parseInt(inv.amount), 0);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between items-center px-[8%] py-8 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-black tracking-tighter m-0">INVOICE.OS</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest m-0">Institutional RWA Protocol</p>
        </div>
        
        {connected && (
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase m-0">Global TVL</p>
              <p className="text-xl font-black text-black m-0">${totalValue.toLocaleString()}</p>
            </div>
            <button onClick={disconnect} className="bg-transparent border border-red-200 text-red-500 px-4 py-2 rounded-full text-xs font-bold hover:bg-red-50 transition-all">
              Disconnect
            </button>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {!connected ? (
          <div className="bg-white border border-gray-200 p-20 rounded-[3rem] text-center shadow-sm">
            <h2 className="text-4xl font-black tracking-tight mb-4">Connect Wallet to Mint Assets</h2>
            <div className="flex flex-col gap-3 max-w-xs mx-auto mt-12">
              {wallets.map((w) => (
                <button key={w.name} onClick={() => connect(w.name)} className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:opacity-90">
                  Connect {w.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ACTION CARD */}
            <section className="bg-white border border-gray-200 p-12 rounded-[2.5rem] mb-16 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-md">
                <h3 className="text-2xl font-black mb-2">Mint New RWA</h3>
                <p className="text-gray-400 text-sm">Issue a Move-native asset representing verified accounts receivable.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="px-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Amount ($)</p>
                  <input 
                    type="number" 
                    value={customAmount} 
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className="bg-transparent text-2xl font-black w-24 outline-none"
                  />
                </div>
                <button onClick={mintInvoice} disabled={isMinting} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-black/10">
                  {isMinting ? "MINTING..." : "MINT ASSET"}
                </button>
              </div>
            </section>

            {/* SEARCH */}
            <input 
              placeholder="Filter by Asset ID..." 
              className="w-full bg-white border border-gray-200 px-8 py-5 rounded-2xl outline-none mb-12 text-lg shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInvoices.map((inv, i) => (
                <div key={i} className="rwa-premium-card">
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-[10px] font-black tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded">RWA-STANDARD</span>
                    <span className="text-[10px] font-bold text-gray-300">UNPAID</span>
                  </div>
                  
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Asset ID</p>
                  <div className="text-xl font-bold mb-10 tracking-tight">{inv.id}</div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-3xl font-black italic">${parseInt(inv.amount).toLocaleString()}</span>
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
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
