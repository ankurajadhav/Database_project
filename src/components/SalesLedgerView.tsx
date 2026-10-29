import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  Printer, 
  Download,
  ChevronDown, 
  ChevronUp, 
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react';
import { Sale } from '../types/index.ts';
import { downloadReceipt } from '../utils/receiptGenerator.ts';

interface SalesLedgerViewProps {
  sales: Sale[];
  onOpenReceipt: (sale: Sale) => void;
}

export const SalesLedgerView: React.FC<SalesLedgerViewProps> = ({
  sales,
  onOpenReceipt
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadSale = (sale: Sale, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = downloadReceipt(sale, 'txt');
    if (success) {
      setDownloadNotice(`Downloaded Receipt #SALE-${sale.saleId} (.txt)`);
      setTimeout(() => setDownloadNotice(null), 3500);
    }
  };

  const filteredSales = sales.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.saleId.toString().includes(q) ||
           (s.customerName && s.customerName.toLowerCase().includes(q)) ||
           (s.clerkName && s.clerkName.toLowerCase().includes(q));
  });

  const toggleExpand = (id: number) => {
    setExpandedSaleId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadNotice} - File saved to your downloads folder.</span>
          </div>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales & Transactions Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of all retail checkouts · Preserved historical sale prices · Reconciled payments
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Recorded Sales: <span className="font-bold text-slate-900">{sales.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by sale ID, customer, or clerk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Main Relational Sales Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Sale ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Attendant Clerk</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Discount</th>
                <th className="py-2.5 px-3 text-right">Payable</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => {
                const isExpanded = expandedSaleId === sale.saleId;

                return (
                  <React.Fragment key={sale.saleId}>
                    <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-slate-50/90' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                        #{sale.saleId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {sale.saleDateTime}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {sale.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {sale.clerkName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        ₹{sale.taxAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                        ₹{sale.orderDiscountAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₹{(sale.orderPayableAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 tabular-nums">
                        ₹{(sale.totalPaid || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                          sale.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => toggleExpand(sale.saleId)}
                          className="px-2 py-1 text-[11px] rounded border border-slate-200 hover:bg-white text-slate-700 font-medium inline-flex items-center gap-1 transition-colors"
                          title="View line items"
                        >
                          <span>Items</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleDownloadSale(sale)}
                          className="px-2 py-1 text-[11px] rounded border border-slate-300 hover:bg-slate-100 text-slate-800 font-medium inline-flex items-center gap-1 transition-colors"
                          title="Download Receipt (.txt)"
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                          onClick={() => onOpenReceipt(sale)}
                          className="px-2 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-white font-medium inline-flex items-center gap-1 transition-colors"
                          title="View Receipt"
                        >
                          <Receipt className="w-3 h-3" />
                          <span className="hidden sm:inline">Receipt</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Line Items Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={10} className="py-3 px-6">
                          <div className="bg-white border border-slate-200 rounded p-3 space-y-3 shadow-xs">
                            <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                              <span>SALE_ITEM Junction Records for Transaction #{sale.saleId}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Rule: QuantitySold × UnitPriceAtSale − LineDiscount
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 text-slate-400 font-medium text-[11px]">
                                    <th className="py-1.5 px-2">Line ID</th>
                                    <th className="py-1.5 px-2">Product</th>
                                    <th className="py-1.5 px-2 text-center">Qty Sold</th>
                                    <th className="py-1.5 px-2 text-right">Price at Sale</th>
                                    <th className="py-1.5 px-2 text-right">Line Discount</th>
                                    <th className="py-1.5 px-2 text-right">Net Line Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {sale.items && sale.items.map(item => (
                                    <tr key={item.saleItemId}>
                                      <td className="py-1.5 px-2 font-mono text-slate-500">#{item.saleItemId}</td>
                                      <td className="py-1.5 px-2 font-medium text-slate-800">{item.productName}</td>
                                      <td className="py-1.5 px-2 text-center font-mono">{item.quantitySold} {item.unit}</td>
                                      <td className="py-1.5 px-2 text-right font-mono tabular-nums">₹{item.unitPriceAtSale.toFixed(2)}</td>
                                      <td className="py-1.5 px-2 text-right font-mono text-emerald-700 tabular-nums">₹{item.lineDiscount.toFixed(2)}</td>
                                      <td className="py-1.5 px-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                                        ₹{(item.netLineValue || 0).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Tender Payments Summary */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-700">Tender Payments:</span>
                                {sale.payments && sale.payments.map(p => (
                                  <span key={p.paymentId} className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                                    {p.paymentMethod} (Ref: {p.transactionRef}): ₹{p.amount.toFixed(2)} - {p.paymentStatus}
                                  </span>
                                ))}
                              </div>
                              <div className="font-mono text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" /> Fully Settled
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
