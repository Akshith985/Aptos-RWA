import { InvoiceList } from "./InvoiceList";

interface IssuerViewProps {
    customAmount: number;
    setCustomAmount: (amount: number) => void;
    mintInvoice: () => void;
    isMinting: boolean;
    invoices: any[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export function IssuerView({
    customAmount,
    setCustomAmount,
    mintInvoice,
    isMinting,
    invoices,
    searchTerm,
    setSearchTerm,
}: IssuerViewProps) {
    return (
        <div className="space-y-10">
            <section className="bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>

                <div className="relative">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                        Issue New Asset
                    </h3>
                    <p className="text-muted-foreground text-sm mb-8">Mint a new invoice on the Aptos blockchain.</p>

                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                                Face Value (USD)
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium group-focus-within:text-primary transition-colors">$</span>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-4 bg-background border border-input rounded-xl font-bold text-lg text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <button
                            onClick={mintInvoice}
                            disabled={isMinting}
                            className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {isMinting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Minting Invoice...
                                </span>
                            ) : (
                                "Mint New Asset"
                            )}
                        </button>
                    </div>
                </div>
            </section>

            <InvoiceList
                invoices={invoices}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                view="issuer"
            />
        </div>
    );
}
