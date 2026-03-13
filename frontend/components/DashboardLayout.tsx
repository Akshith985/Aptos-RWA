import { Search, Bell, User } from "lucide-react";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col">
        <div className="p-6 font-bold text-xl tracking-tight">InvoiceProtocol</div>
        <nav className="flex-1 px-4 space-y-2">
          <div className="p-3 bg-blue-600 rounded-lg cursor-pointer">Invoices</div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">Settings</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 cursor-pointer">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
