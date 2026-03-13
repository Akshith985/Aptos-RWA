import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ThemeToggle } from "./ThemeToggle";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface DashboardLayoutProps {
    children: ReactNode;
    view: "issuer" | "investor";
    setView: (view: "issuer" | "investor") => void;
    totalValue: number;
}

export function DashboardLayout({ children, view, setView, totalValue }: DashboardLayoutProps) {
    const { connected, disconnect } = useWallet();

    return (
        <div className="flex min-h-screen bg-background font-sans selection:bg-blue-100 dark:selection:bg-primary/20 selection:text-blue-900 dark:selection:text-primary-foreground flex-col">
            <Header />
            <div className="flex flex-1 w-full">
                <Sidebar view={view} setView={setView} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <main className="flex-1 p-8 overflow-y-auto bg-background">
                        <div className="max-w-7xl mx-auto pb-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}
