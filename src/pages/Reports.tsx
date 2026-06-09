import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { BarChart3, TrendingUp, DollarSign, FileText, CheckCircle2 } from "lucide-react";

interface StatsType {
  totalSpend: number;
  totalRfqs: number;
  totalPos: number;
  totalInvoices: number;
  rfqsByStatus: { status: string; _count: { id: number } }[];
  posByStatus: { status: string; _count: { id: number } }[];
}

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setStats(res.data.data);
      } catch (err) {
        console.error("Error loading reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallbacks
  const totalSpend = stats?.totalSpend || 284900;
  const totalRfqs = stats?.totalRfqs || 18;
  const totalPos = stats?.totalPos || 12;
  const totalInvoices = stats?.totalInvoices || 8;

  return (
    <div className="space-y-6">
      <div className="border-b border-border-default pb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Procurement Reports &amp; Analytics</h1>
        <p className="text-text-secondary text-xs mt-0.5">Audit transaction logs, monitor budgets, and view departmental performance summaries.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border-default p-4 rounded shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cumulative Spend</span>
            <DollarSign className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <div className="text-[10px] text-brand-success font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% Year-to-Date</span>
          </div>
        </div>

        <div className="bg-white border border-border-default p-4 rounded shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dispatched RFQs</span>
            <FileText className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{totalRfqs}</p>
          <span className="text-[10px] text-text-secondary font-semibold">Active bidding cycles</span>
        </div>

        <div className="bg-white border border-border-default p-4 rounded shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Purchase Orders</span>
            <CheckCircle2 className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{totalPos}</p>
          <span className="text-[10px] text-text-secondary font-semibold">Active supplier contracts</span>
        </div>

        <div className="bg-white border border-border-default p-4 rounded shadow-sm space-y-1">
          <div className="flex justify-between items-center text-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider">Settled Invoices</span>
            <BarChart3 className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-xl font-bold text-text-primary">{totalInvoices}</p>
          <span className="text-[10px] text-text-secondary font-semibold">Net 30 payable items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Category Distribution Card */}
        <div className="lg:col-span-2 bg-white border border-border-default rounded p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
            Quarterly Spend by Sourcing Department
          </h3>
          
          <div className="space-y-4 pt-2">
            {/* Dept Item 1 */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary">IT Infrastructure &amp; Hardware</span>
                <span className="text-brand-primary">$138,400 (48.5%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div className="bg-brand-primary h-full rounded" style={{ width: "48.5%" }}></div>
              </div>
            </div>

            {/* Dept Item 2 */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary">Office Supplies &amp; Consumables</span>
                <span className="text-brand-primary">$62,100 (21.8%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div className="bg-brand-primary h-full rounded" style={{ width: "21.8%" }}></div>
              </div>
            </div>

            {/* Dept Item 3 */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary">Logistics, Transport &amp; Freight</span>
                <span className="text-brand-primary">$49,200 (17.3%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div className="bg-brand-primary h-full rounded" style={{ width: "17.3%" }}></div>
              </div>
            </div>

            {/* Dept Item 4 */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary">Corporate Services &amp; Consulting</span>
                <span className="text-brand-primary">$35,200 (12.4%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                <div className="bg-brand-primary h-full rounded" style={{ width: "12.4%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Metrics Card */}
        <div className="bg-white border border-border-default rounded p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
            Compliance &amp; Lead Time
          </h3>

          <div className="space-y-3.5 text-xs text-text-secondary pt-2">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded">
              <span className="text-[10px] text-text-secondary font-bold uppercase block">Avg RFQ Bidding Window</span>
              <strong className="text-text-primary text-sm">7.4 Days</strong>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded">
              <span className="text-[10px] text-text-secondary font-bold uppercase block">PO Approval Turnaround</span>
              <strong className="text-text-primary text-sm">1.8 Days</strong>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded">
              <span className="text-[10px] text-text-secondary font-bold uppercase block">Audit Trails Captured</span>
              <strong className="text-text-primary text-sm">1,208 Operations</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
