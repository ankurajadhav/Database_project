import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus,
  PlusCircle, 
  Clock,
  UserCheck
} from 'lucide-react';
import { DashboardStats } from '../types/index.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigate: (tab: string) => void;
  onOpenNewCustomer?: () => void;
  onOpenNewClerk?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigate,
  onOpenNewCustomer,
  onOpenNewClerk
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-slate-500 font-mono">Loading Oracle metrics...</div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Today's Gross Sales",
      value: `₹${stats.todaySalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `${stats.todaySalesCount} transactions logged`,
      icon: DollarSign,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      title: "Completed Payments",
      value: `₹${stats.totalCompletedPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Settled via Cash, Card & UPI`,
      icon: CreditCard,
      color: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      title: "Registered Customers",
      value: `${stats.totalCustomersCount}`,
      subtitle: "Active loyalty member profiles",
      icon: UserCheck,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200"
    },
    {
      title: "Low Stock Items",
      value: `${stats.lowStockItemsCount}`,
      subtitle: `Out of ${stats.totalProductsCount} monitored products`,
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-50 border-rose-200"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Retail Management & POS Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Oracle relational telemetry · ACID Transaction isolation: READ COMMITTED
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onOpenNewCustomer && (
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Customer</span>
            </button>
          )}
          {onOpenNewClerk && (
            <button
              onClick={onOpenNewClerk}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Clerk</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Launch POS Register</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-600">{kpi.title}</span>
                <div className={`p-1.5 rounded border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {kpi.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Split: Recent Transactions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Recent Sales Transactions */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Sales Transactions</h2>
              <span className="text-[11px] text-slate-500">Atomic sale commits with customer & clerk joins</span>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2 px-2">Sale ID</th>
                  <th className="py-2 px-2">Customer</th>
                  <th className="py-2 px-2">Clerk</th>
                  <th className="py-2 px-2 text-right">Payable</th>
                  <th className="py-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentSales.map((sale) => (
                  <tr key={sale.saleId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-2 font-mono font-medium text-slate-800">
                      #{sale.saleId}
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-900">
                      {sale.customerName}
                    </td>
                    <td className="py-2.5 px-2 text-slate-600">
                      {sale.clerkName}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{(sale.orderPayableAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                        sale.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Cols: Top Selling Products & Low Stock Alert */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Top Selling Products */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Top Selling Products</h2>
              <span className="text-[11px] text-slate-400 font-mono">By volume</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {stats.topSellingProducts.map((prod, idx) => (
                <div key={prod.productId} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-900">{prod.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {prod.totalQuantitySold} units sold
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{prod.totalRevenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
