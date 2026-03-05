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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-background dark:via-background dark:to-background">
          <div className="bg-card p-8 md:p-12 rounded-3xl border border-border text-center max-w-md w-full shadow-xl transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 md:mb-8 tracking-tight">Welcome to Invoice.OS</h2>
            <p className="mb-8 text-base md:text-lg text-muted-foreground font-medium">Aptos-powered institutional invoice marketplace</p>
            <div className="grid gap-3 w-full">
              {wallets && wallets.length > 0 ? (
                wallets.map((w) => (
                  <button
                    key={w.name}
                    onClick={() => connect(w.name)}
                    className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 shadow-md"
                  >
                    {w.icon && (
                      <img 
                        src={w.icon} 
                        alt={w.name} 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span>Connect {w.name}</span>
                  </button>
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm">No wallet detected</p>
                  <a
                    href="https://petra.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
        </div>
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