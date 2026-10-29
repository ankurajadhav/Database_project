/**
 * Smart Grocery Retail Management and Payment System
 * Relational Database Management & Point-of-Sale System
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PosCheckoutView } from './components/PosCheckoutView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { SalesLedgerView } from './components/SalesLedgerView.tsx';
import { SuppliersView } from './components/SuppliersView.tsx';
import { SqlStudioView } from './components/SqlStudioView.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { 
  Customer, 
  Clerk, 
  Category, 
  Product, 
  Sale, 
  Supplier, 
  StockReceipt, 
  DashboardStats 
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);

  // New Customer Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newCustomerPoints, setNewCustomerPoints] = useState<string>('0');
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);
  const [isSavingCustomer, setIsSavingCustomer] = useState<boolean>(false);
  const [latestCustomerId, setLatestCustomerId] = useState<number | null>(null);

  // New Clerk Modal State
  const [isClerkModalOpen, setIsClerkModalOpen] = useState<boolean>(false);
  const [newClerkName, setNewClerkName] = useState<string>('');
  const [newClerkEmail, setNewClerkEmail] = useState<string>('');
  const [newClerkPhone, setNewClerkPhone] = useState<string>('');
  const [newClerkShift, setNewClerkShift] = useState<string>('Morning');
  const [clerkFormError, setClerkFormError] = useState<string | null>(null);
  const [isSavingClerk, setIsSavingClerk] = useState<boolean>(false);
  const [latestClerkId, setLatestClerkId] = useState<number | null>(null);

  // Relational Entities State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clerks, setClerks] = useState<Clerk[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all database records atomically from Express / Serverless API
  const refreshDatabase = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) {
        throw new Error(`API bootstrap failed with status ${res.status}`);
      }
      const payload = await res.json();

      setStats(payload.stats);
      setProducts(payload.products);
      setCustomers(payload.customers);
      setClerks(payload.clerks);
      setCategories(payload.categories);
      setSales(payload.sales);
      setSuppliers(payload.suppliers);
      setStockReceipts(payload.stockReceipts);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, []);

  const handleResetDb = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetDb = async () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to reset database');
      }
      setReceiptSale(null);
      setLatestCustomerId(null);
      setLatestClerkId(null);
      await refreshDatabase();
      setResetCounter(prev => prev + 1);
      setResetNotice('Database reset to initial report seed data successfully.');
      setTimeout(() => setResetNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenNewCustomer = () => {
    setCustomerFormError(null);
    setIsCustomerModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerFormError(null);

    if (!newCustomerName.trim()) {
      setCustomerFormError('Customer Name is required.');
      return;
    }

    const parsedPoints = parseInt(newCustomerPoints || '0', 10);
    if (Number.isNaN(parsedPoints) || parsedPoints < 0) {
      setCustomerFormError('Loyalty points must be a non-negative integer.');
      return;
    }

    setIsSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newCustomerName.trim(),
          customerEmail: newCustomerEmail.trim() || null,
          customerPhone: newCustomerPhone.trim() || null,
          loyaltyPoints: parsedPoints
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register customer');
      }

      await refreshDatabase();
      setLatestCustomerId(data.customerId);
      setIsCustomerModalOpen(false);
      setNewCustomerName('');
      setNewCustomerEmail('');
      setNewCustomerPhone('');
      setNewCustomerPoints('0');
      setResetNotice(`Customer "${data.customerName}" (#${data.customerId}) registered in database.`);
      setTimeout(() => setResetNotice(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCustomerFormError(message);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleOpenNewClerk = () => {
    setClerkFormError(null);
    setIsClerkModalOpen(true);
  };

  const handleCreateClerk = async (e: React.FormEvent) => {
    e.preventDefault();
    setClerkFormError(null);

    if (!newClerkName.trim()) {
      setClerkFormError('Clerk Name is required.');
      return;
    }

    setIsSavingClerk(true);
    try {
      const res = await fetch('/api/clerks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkName: newClerkName.trim(),
          clerkEmail: newClerkEmail.trim() || null,
          clerkPhone: newClerkPhone.trim() || null,
          shift: newClerkShift
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register clerk');
      }

      await refreshDatabase();
      setLatestClerkId(data.clerkId);
      setIsClerkModalOpen(false);
      setNewClerkName('');
      setNewClerkEmail('');
      setNewClerkPhone('');
      setNewClerkShift('Morning');
      setResetNotice(`Clerk "${data.clerkName}" (#${data.clerkId}) registered in database.`);
      setTimeout(() => setResetNotice(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setClerkFormError(message);
    } finally {
      setIsSavingClerk(false);
    }
  };

  const handleSaleCompleted = (newSale: Sale) => {
    setReceiptSale(newSale);
    refreshDatabase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {resetNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{resetNotice}</span>
            </div>
            <button
              onClick={() => setResetNotice(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="space-y-2 text-center">
              <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-slate-500">Connecting to Oracle Database Engine...</p>
            </div>
          </div>
        ) : (
          <React.Fragment key={resetCounter}>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                onNavigate={setActiveTab}
                onOpenNewCustomer={handleOpenNewCustomer}
                onOpenNewClerk={handleOpenNewClerk}
              />
            )}

            {activeTab === 'pos' && (
              <PosCheckoutView
                products={products}
                categories={categories}
                customers={customers}
                clerks={clerks}
                onSaleCompleted={handleSaleCompleted}
                onOpenReceipt={(s) => setReceiptSale(s)}
                onOpenNewCustomer={handleOpenNewCustomer}
                latestCustomerId={latestCustomerId}
                onOpenNewClerk={handleOpenNewClerk}
                latestClerkId={latestClerkId}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={products}
                categories={categories}
                onProductAdded={() => refreshDatabase()}
                onCategoryAdded={() => refreshDatabase()}
              />
            )}

            {activeTab === 'sales' && (
              <SalesLedgerView
                sales={sales}
                onOpenReceipt={(s) => setReceiptSale(s)}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                suppliers={suppliers}
                stockReceipts={stockReceipts}
                products={products}
                onReceiptReceived={() => refreshDatabase()}
                onReceiptCreated={() => refreshDatabase()}
                onSupplierCreated={() => refreshDatabase()}
              />
            )}

            {activeTab === 'sql_studio' && (
              <SqlStudioView />
            )}
          </React.Fragment>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <span className="font-semibold text-slate-800">Smart Grocery Retail Management & Payment System</span>
        </div>
      </footer>

      {/* Retail Receipt Modal */}
      <ReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />

      {/* Reset Database Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-700" />
                <span>Reset Database</span>
              </h2>
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reset database to initial report seed data? All newly added records, transactions, and stock changes will be restored to baseline state.
            </p>
            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetDb}
                disabled={isResetting}
                className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Customer</h2>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {customerFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-xs text-rose-700">
                {customerFormError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Deshmukh"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 9876543210"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. rohan@example.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Initial Loyalty Points</label>
                <input
                  type="number"
                  min="0"
                  value={newCustomerPoints}
                  onChange={(e) => setNewCustomerPoints(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isSavingCustomer ? 'Saving...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Clerk Modal */}
      {isClerkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add New Clerk</h2>
              <button
                type="button"
                onClick={() => setIsClerkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {clerkFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded p-2.5 text-xs text-rose-700">
                {clerkFormError}
              </div>
            )}

            <form onSubmit={handleCreateClerk} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Clerk Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Kulkarni"
                  value={newClerkName}
                  onChange={(e) => setNewClerkName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 9876511011"
                    value={newClerkPhone}
                    onChange={(e) => setNewClerkPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. vikram@example.com"
                    value={newClerkEmail}
                    onChange={(e) => setNewClerkEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assigned Shift</label>
                <select
                  value={newClerkShift}
                  onChange={(e) => setNewClerkShift(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 focus:outline-none"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClerkModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingClerk}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {isSavingClerk ? 'Saving...' : 'Create Clerk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
