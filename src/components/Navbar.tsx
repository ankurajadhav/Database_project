import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Truck, 
  Terminal, 
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDb,
  isResetting
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Checkout', icon: ShoppingCart },
    { id: 'inventory', label: 'Products & Stock', icon: Package },
    { id: 'sales', label: 'Sales Ledger', icon: Receipt },
    { id: 'suppliers', label: 'Suppliers & Receipts', icon: Truck },
    { id: 'sql_studio', label: 'SQL Studio', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark & Academic Kicker */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
              SG
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white whitespace-nowrap">
                Smart Grocery Retail
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, Anti-Slop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (DB Reset) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetDb}
              disabled={isResetting}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
              title="Reset database to initial report seed data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset DB</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 text-xs no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded whitespace-nowrap ${
                  isActive ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
