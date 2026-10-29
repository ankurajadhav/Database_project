import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PackageCheck, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar,
  Building,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Supplier, StockReceipt, Product } from '../types/index.ts';

interface SuppliersViewProps {
  suppliers: Supplier[];
  stockReceipts: StockReceipt[];
  products: Product[];
  onReceiptReceived: (updatedReceipt: StockReceipt) => void;
  onReceiptCreated: (newReceipt: StockReceipt) => void;
  onSupplierCreated?: (newSupplier: Supplier) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  stockReceipts,
  products,
  onReceiptReceived,
  onReceiptCreated,
  onSupplierCreated
}) => {
  const [activeTab, setActiveTab] = useState<'receipts' | 'suppliers'>('receipts');
  const [expandedReceiptId, setExpandedReceiptId] = useState<number | null>(null);
  const [isReceiving, setIsReceiving] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Receipt Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(suppliers[0]?.supplierId || 1);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.productId || 1);
  const [qtyReceived, setQtyReceived] = useState('50');
  const [unitCost, setUnitCost] = useState('45.00');
  const [isCreating, setIsCreating] = useState(false);

  // New Registered Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [supplierFormError, setSupplierFormError] = useState<string | null>(null);
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);

  useEffect(() => {
    if (suppliers.length > 0 && !suppliers.some(s => s.supplierId === selectedSupplierId)) {
      setSelectedSupplierId(suppliers[0].supplierId);
    }
    if (products.length > 0 && !products.some(p => p.productId === selectedProductId)) {
      setSelectedProductId(products[0].productId);
    }
  }, [suppliers, products, selectedSupplierId, selectedProductId]);

  const toggleExpand = (id: number) => {
    setExpandedReceiptId(prev => prev === id ? null : id);
  };

  const handleReceiveStock = async (receiptId: number) => {
    setIsReceiving(receiptId);
    setAlertMessage(null);

    try {
      const res = await fetch(`/api/stock-receipts/${receiptId}/receive`, {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process receipt');
      }

      setAlertMessage({
        type: 'success',
        text: `Receipt #${receiptId} received. Stored procedure PROC_RECEIVE_STOCK executed: inventory balances updated.`
      });
      onReceiptReceived(data.receipt);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAlertMessage({
        type: 'error',
        text: message
      });
    } finally {
      setIsReceiving(null);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setAlertMessage(null);

    try {
      const payload = {
        supplierId: selectedSupplierId,
        items: [
          {
            productId: selectedProductId,
            qtyReceived: parseInt(qtyReceived, 10),
            purchaseUnitCost: parseFloat(unitCost)
          }
        ]
      };

      const res = await fetch('/api/stock-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create receipt');
      }

      onReceiptCreated(data);
      setIsModalOpen(false);
      setActiveTab('receipts');
      setAlertMessage({
        type: 'success',
        text: `Stock receipt #${data.receiptId} registered in 'Pending' state.`
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAlertMessage({ type: 'error', text: message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierFormError(null);
    setAlertMessage(null);

    if (!newSupplierName.trim()) {
      setSupplierFormError('Supplier Name is required.');
      return;
    }

    setIsCreatingSupplier(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: newSupplierName.trim(),
          supplierPhone: newSupplierPhone.trim() || null,
          supplierEmail: newSupplierEmail.trim() || null
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register supplier');
      }

      if (onSupplierCreated) {
        onSupplierCreated(data);
      }
      setSelectedSupplierId(data.supplierId);
      setIsSupplierModalOpen(false);
      setNewSupplierName('');
      setNewSupplierPhone('');
      setNewSupplierEmail('');
      setActiveTab('suppliers');
      setAlertMessage({
        type: 'success',
        text: `Supplier "${data.supplierName}" (#${data.supplierId}) registered in database.`
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSupplierFormError(message);
    } finally {
      setIsCreatingSupplier(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Suppliers & Stock Receipts</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setSupplierFormError(null);
              setIsSupplierModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Registered Suppliers</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Stock Receipt</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMessage && (
        <div className={`p-3 rounded text-xs flex items-start gap-2.5 border ${
          alertMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="font-mono text-[11px] leading-relaxed">
            {alertMessage.text}
          </div>
        </div>
      )}

      {/* Tab Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded w-fit text-xs">
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-3 py-1.5 font-medium rounded transition-colors ${
            activeTab === 'receipts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Receipts ({stockReceipts.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 font-medium rounded transition-colors ${
            activeTab === 'suppliers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Registered Suppliers ({suppliers.length})
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'receipts' ? (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Receipt ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3 text-right">Procurement Value</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockReceipts.map(receipt => {
                  const isExpanded = expandedReceiptId === receipt.receiptId;
                  const isReceived = receipt.receiptStatus === 'Received';

                  return (
                    <React.Fragment key={receipt.receiptId}>
                      <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-slate-50/90' : ''}`}>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          #{receipt.receiptId}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {receipt.receiptDate}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {receipt.supplierName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          ₹{(receipt.totalCost || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                            isReceived
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {receipt.receiptStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => toggleExpand(receipt.receiptId)}
                            className="px-2 py-1 text-[11px] rounded border border-slate-200 hover:bg-white text-slate-700 font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Items</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {!isReceived && (
                            <button
                              onClick={() => handleReceiveStock(receipt.receiptId)}
                              disabled={isReceiving === receipt.receiptId}
                              className="px-2.5 py-1 text-[11px] rounded font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                              title="Receive shipment and update inventory"
                            >
                              {isReceiving === receipt.receiptId ? 'Processing...' : 'Receive Stock'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Line Items Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={6} className="py-3 px-6">
                            <div className="bg-white border border-slate-200 rounded p-3 space-y-2 shadow-xs">
                              <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                                <span>STOCK_RECEIPT_ITEM Line Records for Receipt #{receipt.receiptId}</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Rule: QtyReceived × PurchaseUnitCost
                                </span>
                              </div>

                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 text-slate-400 font-medium text-[11px]">
                                    <th className="py-1 px-2">Line ID</th>
                                    <th className="py-1 px-2">Product Name</th>
                                    <th className="py-1 px-2 text-center">Qty Received</th>
                                    <th className="py-1 px-2 text-right">Purchase Unit Cost</th>
                                    <th className="py-1 px-2 text-right">Line Total Cost</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {receipt.items && receipt.items.map(item => (
                                    <tr key={item.receiptItemId}>
                                      <td className="py-1 px-2 font-mono text-slate-500">#{item.receiptItemId}</td>
                                      <td className="py-1 px-2 font-medium text-slate-900">{item.productName}</td>
                                      <td className="py-1 px-2 text-center font-mono">{item.qtyReceived} units</td>
                                      <td className="py-1 px-2 text-right font-mono tabular-nums">₹{item.purchaseUnitCost.toFixed(2)}</td>
                                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                                        ₹{(item.lineTotal || 0).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
      ) : (
        /* Suppliers Table */
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Supplier ID</th>
                  <th className="py-2.5 px-3">Supplier Organization</th>
                  <th className="py-2.5 px-3">Telephone</th>
                  <th className="py-2.5 px-3">Email Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map(s => (
                  <tr key={s.supplierId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-600">
                      #{s.supplierId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {s.supplierName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {s.supplierPhone || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {s.supplierEmail || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Stock Receipt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Create Inbound Stock Receipt</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50"
                >
                  {suppliers.map(s => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Received Product Item</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50"
                >
                  {products.map(p => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qtyReceived}
                    onChange={(e) => setQtyReceived(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Purchase Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isCreating ? 'Creating...' : 'Register Inbound Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Registered Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Register New Supplier</h2>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {supplierFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-xs text-rose-700">
                {supplierFormError}
              </div>
            )}

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Supplier Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Wholesale Traders"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Telephone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876521011"
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. metro@example.com"
                    value={newSupplierEmail}
                    onChange={(e) => setNewSupplierEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSupplier}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isCreatingSupplier ? 'Registering...' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
