import { useState, useEffect } from "react";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { DashboardLayout } from "./components/DashboardLayout";
import { IssuerView } from "./components/IssuerView";
import { InvestorView } from "./components/InvestorView";

const MODULE_ADDRESS = "0x0c78e01d2569757cfcdfda3ace5e81227c77145c254f12f21da825a243638f2b";
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

function App() {
  const { account, connected, wallets, connect, signAndSubmitTransaction } = useWallet();
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
      options: {
        maxGasAmount: 1000000,
        gasUnitPrice: 100,
        
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      await fetchInvoices();
    } catch (e) { console.error(e); } finally { setIsMinting(false); }
  };

  // Logic for total value calculation (was in App.tsx render scope)
  const totalValue = invoices.reduce((acc, inv) => acc + parseInt(inv.amount), 0);

  if (!connected) {
    return (
      <DashboardLayout view={view} setView={setView} totalValue={totalValue}>
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 bg-gradient-to-br from-blue-100 via-white to-slate-100 dark:from-background dark:via-background dark:to-background">
          <div className="bg-card p-6 sm:p-10 md:p-14 rounded-3xl border border-border text-center max-w-lg w-full shadow-2xl transition-all duration-300 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-primary mb-4 md:mb-6 tracking-tight leading-tight drop-shadow-sm">
              Invoice.OS
            </h1>
            <p className="mb-8 text-lg md:text-xl text-muted-foreground font-medium max-w-md mx-auto">
              The next-gen institutional invoice marketplace powered by Aptos blockchain.
            </p>
            <div className="w-full flex flex-col gap-4">
              {wallets && wallets.length > 0 ? (
                wallets.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => connect(w.name)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all flex items-center justify-center gap-3 shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {w.icon && (
                      <img 
                        src={w.icon} 
                        alt={w.name} 
                        className="w-7 h-7 rounded-full"
                      />
                    )}
                    <span>Connect {w.name}</span>
                  </button>
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 text-base">No wallet detected</p>
                  <a
                    href="https://petra.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all text-lg shadow-lg"
                  >
                    Download Petra Wallet
                  </a>
                  <p className="text-xs text-slate-500">
                    After installing, refresh this page to connect
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout view={view} setView={setView} totalValue={totalValue}>
      {view === "issuer" ? (
        <IssuerView
          customAmount={customAmount}
          setCustomAmount={setCustomAmount}
          mintInvoice={mintInvoice}
          isMinting={isMinting}
          invoices={invoices}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      ) : (
        <InvestorView
          invoices={invoices}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </DashboardLayout>
  );
}

export default App;