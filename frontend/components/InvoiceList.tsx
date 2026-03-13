import { Search } from "lucide-react";
import React, { useState } from "react";

interface Invoice {
    id: string;
    amount: string;
    status: number;
    due_date: number;
    created_at: number;
    paid_at: number;
}

interface InvoiceListProps {
    invoices: Invoice[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    view: "issuer" | "investor";
}


    // Status mapping
    const statusMap: { [key: number]: { label: string; color: string; bg: string } } = {
        0: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100' },
        1: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
        2: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-100' },
        3: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100' },
        4: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-100' },
    };


    // Status filter state
    const [statusFilter, setStatusFilter] = React.useState<number | null>(null);
    // Amount range filter state
    const [minAmount, setMinAmount] = React.useState<string>("");
    const [maxAmount, setMaxAmount] = React.useState<string>("");

    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === null || inv.status === statusFilter;
        const min = minAmount ? parseInt(minAmount) : null;
        const max = maxAmount ? parseInt(maxAmount) : null;
        const matchesMin = min === null || parseInt(inv.amount) >= min;
        const matchesMax = max === null || parseInt(inv.amount) <= max;
        return matchesSearch && matchesStatus && matchesMin && matchesMax;
    });

    // Transfer dialog state
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferInvoiceId, setTransferInvoiceId] = useState<string | null>(null);
    const [recipient, setRecipient] = useState("");
    const [transferStatus, setTransferStatus] = useState<string>("");

    const handleTransfer = (invoiceId: string) => {
        setTransferInvoiceId(invoiceId);
        setRecipient("");
        setTransferStatus("");
        setTransferOpen(true);
    };

    // Dummy transfer handler (replace with actual transaction logic)
    const submitTransfer = async () => {
        setTransferStatus("Transferring...");
        setTimeout(() => {
            setTransferStatus("Transfer complete!");
            setTimeout(() => setTransferOpen(false), 1200);
        }, 1200);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center flex-wrap">
                <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />

                {/* Status filter dropdown */}
                <select
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={statusFilter ?? ''}
                    onChange={e => setStatusFilter(e.target.value === '' ? null : Number(e.target.value))}
                >
                    <option value="">All Statuses</option>
                    {Object.entries(statusMap).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>
                {/* Amount range filter */}
                <input
                    type="number"
                    placeholder="Min Amount"
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    min={0}
                />
                <input
                    type="number"
                    placeholder="Max Amount"
                    value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    className="w-28 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    min={0}
                />
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInvoices.map((inv, i) => (
                    <div
                        key={i}
                        className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <span className="font-bold text-xs">INV</span>
                            </div>
                            {/* Status badge */}
                            <div className={`px-2.5 py-1 ${statusMap[inv.status]?.bg} ${statusMap[inv.status]?.color} text-[10px] font-bold tracking-wide uppercase rounded-full border border-slate-100`}>
                                {statusMap[inv.status]?.label ?? 'Unknown'}
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <p className="text-xs text-slate-400 font-medium">Invoice ID</p>
                            <div className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{inv.id}</div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Amount</p>
                                <span className="text-lg font-bold text-slate-900">
                                    ${parseInt(inv.amount).toLocaleString()}
                                </span>
                            </div>

                            {/* Action buttons for status changes (issuer view) */}
                            {view === "issuer" ? (
                                <div className="flex gap-2">
                                    {/* ...existing status change buttons... */}
                                    <button
                                        onClick={() => handleTransfer(inv.id)}
                                        className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        Transfer
                                    </button>
                                </div>
                            ) : (
                                <span className={`flex items-center gap-1.5 text-xs font-bold ${statusMap[inv.status]?.color} ${statusMap[inv.status]?.bg} px-2 py-1 rounded-md`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusMap[inv.status]?.color} bg-opacity-80`}></div>
                                    {statusMap[inv.status]?.label ?? 'Unknown'}
                                </span>
                            )}
                                                        {/* Transfer dialog */}
                                                        {transferOpen && (
                                                            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-4 border border-slate-200">
                                                                    <h3 className="text-lg font-bold mb-2">Transfer Invoice</h3>
                                                                    <p className="text-sm text-slate-600 mb-2">Enter the recipient's Aptos address to transfer invoice <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{transferInvoiceId}</span></p>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Recipient address"
                                                                        value={recipient}
                                                                        onChange={e => setRecipient(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                    />
                                                                    <div className="flex gap-2 mt-2">
                                                                        <button
                                                                            onClick={submitTransfer}
                                                                            className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                                                                            disabled={!recipient || transferStatus === "Transferring..."}
                                                                        >
                                                                            {transferStatus === "Transferring..." ? "Transferring..." : "Confirm Transfer"}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setTransferOpen(false)}
                                                                            className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                                                                            disabled={transferStatus === "Transferring..."}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                    {transferStatus && (
                                                                        <div className="text-center text-xs text-green-600 mt-2">{transferStatus}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                {/* Timeline/status history placeholder */}
                                                {/* <div className="mt-4">
                                                    <TimelineComponent status={inv.status} createdAt={inv.created_at} paidAt={inv.paid_at} dueDate={inv.due_date} />
                                                </div> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
