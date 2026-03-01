import { LayoutDashboard, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
    view: "issuer" | "investor";
    setView: (view: "issuer" | "investor") => void;
}

export function Sidebar({ view, setView }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`${isCollapsed ? "w-20" : "w-72"} bg-card text-muted-foreground min-h-screen p-4 flex flex-col border-r border-border transition-all duration-300 relative`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground border border-background hover:bg-primary/90 transition-colors shadow-lg z-20"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={`mb-10 px-2 flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                    <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
                </div>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold tracking-tight text-foreground whitespace-nowrap overflow-hidden transition-opacity duration-300">
                        INVOICE.OS
                    </h1>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                <button
                    onClick={() => setView("issuer")}
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-3.5 rounded-xl transition-all duration-200 group relative ${view === "issuer"
                        ? "bg-primary/10 text-primary shadow-inner"
                        : "hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <LayoutDashboard size={20} className={view === "issuer" ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
                    {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">Create Invoice</span>}

                    {/* Tooltip */}
                    {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-border">
                            Create Invoice
                        </div>
                    )}
                </button>

                <button
                    onClick={() => setView("investor")}
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-3.5 rounded-xl transition-all duration-200 group relative ${view === "investor"
                        ? "bg-primary/10 text-primary shadow-inner"
                        : "hover:bg-secondary hover:text-foreground"
                        }`}
                >
                    <Store size={20} className={view === "investor" ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
                    {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">Marketplace</span>}

                    {/* Tooltip */}
                    {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-border">
                            Marketplace
                        </div>
                    )}
                </button>
            </nav>

            <div className="mt-auto">
                <div className={`px-4 py-4 bg-secondary rounded-xl border border-border backdrop-blur-sm ${isCollapsed ? "flex justify-center px-0" : ""}`}>
                    {isCollapsed ? (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="Aptos Testnet"></div>
                    ) : (
                        <>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 whitespace-nowrap">Current Network</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-sm font-semibold text-foreground whitespace-nowrap">Aptos Testnet</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
