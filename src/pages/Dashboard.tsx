import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { 
  Users, ClipboardList, CheckSquare, CreditCard, 
  Activity, ArrowRight, ChevronRight
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface PO {
  id: string;
  poNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  quotation: {
    vendor: {
      name: string;
    };
    rfq: {
      title: string;
    };
  };
}

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PO[]>([]);
  const [latestRFQs, setLatestRFQs] = useState<RFQ[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Vendor specific state
  const [vendorRFQs, setVendorRFQs] = useState<RFQ[]>([]);
  const [vendorPOs, setVendorPOs] = useState<PO[]>([]);
  const [vendorInvoiceCount, setVendorInvoiceCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role !== "VENDOR") {
          const [analyticsRes, logsRes, posRes, rfqsRes, invoicesRes] = await Promise.all([
            api.get("/analytics/dashboard"),
            api.get("/analytics/audit-logs"),
            api.get("/purchase-orders"),
            api.get("/rfqs"),
            api.get("/purchase-orders/invoices"),
          ]);
          
          setAnalytics(analyticsRes.data.data);
          setLogs(logsRes.data.data.slice(0, 5));
          
          // Filter pending POs
          const allPOs = posRes.data.data || [];
          setPendingPOs(allPOs.filter((p: PO) => p.status === "PENDING_APPROVAL").slice(0, 5));
          
          // Sort and slice latest RFQs
          const allRFQs = rfqsRes.data.data || [];
          setLatestRFQs(allRFQs.slice(0, 5));
          
          // Count total invoices
          setInvoiceCount(invoicesRes.data.data?.length || 0);
        } else {
          // Vendor specific summary
          const [rfqsRes, posRes, invoicesRes] = await Promise.all([
            api.get("/rfqs"),
            api.get("/purchase-orders"),
            api.get("/purchase-orders/invoices"),
          ]);
          setVendorRFQs(rfqsRes.data.data?.slice(0, 5) || []);
          setVendorPOs(posRes.data.data?.slice(0, 5) || []);
          setVendorInvoiceCount(invoicesRes.data.data?.length || 0);
          setAnalytics({
            rfqCount: rfqsRes.data.data?.length || 0,
            poCount: posRes.data.data?.length || 0,
            invoiceCount: invoicesRes.data.data?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // --- RENDERING FOR ADMINISTRATORS, OFFICERS, MANAGERS ---
  if (user?.role !== "VENDOR") {
    const totalVendors = analytics?.vendorPerformance?.length || 0;
    const activeRFQs = analytics?.rfqStats?.byStatus?.PUBLISHED || 0;
    const pendingApprovals = analytics?.approvals?.pendingCount || 0;

    return (
      <div className="space-y-6">
        {/* Welcome Info Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Procurement Dashboard</h1>
            <p className="text-text-secondary text-xs mt-0.5">Overview of active procurements, approvals, and transaction logs.</p>
          </div>
          <div className="text-xs bg-white border border-border-default px-3 py-1.5 rounded text-text-secondary font-medium">
            Operational Unit: <span className="text-brand-primary font-bold">{user?.role}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Vendors */}
          <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm hover:border-brand-primary/40 transition">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Total Vendors</span>
                <h3 className="text-xl font-bold text-text-primary">{totalVendors}</h3>
              </div>
              <div className="w-9 h-9 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-text-secondary">
              Registered supplier profiles
            </div>
          </div>

          {/* Card 2: Active RFQs */}
          <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm hover:border-brand-primary/40 transition">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Active RFQs</span>
                <h3 className="text-xl font-bold text-text-primary">{activeRFQs}</h3>
              </div>
              <div className="w-9 h-9 rounded bg-brand-warning/10 flex items-center justify-center text-brand-warning">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-text-secondary">
              Published requests open for bid
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm hover:border-brand-primary/40 transition">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Pending Approvals</span>
                <h3 className="text-xl font-bold text-text-primary">{pendingApprovals}</h3>
              </div>
              <div className="w-9 h-9 rounded bg-brand-success/10 flex items-center justify-center text-brand-success">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-text-secondary">
              POs awaiting review
            </div>
          </div>

          {/* Card 4: Generated Invoices */}
          <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm hover:border-brand-primary/40 transition">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Generated Invoices</span>
                <h3 className="text-xl font-bold text-text-primary">{invoiceCount}</h3>
              </div>
              <div className="w-9 h-9 rounded bg-blue-50/80 flex items-center justify-center text-blue-800 border border-blue-200">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-text-secondary">
              Total billing records in system
            </div>
          </div>
        </div>

        {/* Dashboard Tables Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Left: Pending Approvals & Latest RFQs (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Pending Approvals Table */}
            <div className="bg-bg-card border border-border-default rounded shadow-sm">
              <div className="p-4 border-b border-border-default flex justify-between items-center">
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-success" />
                  <span>Pending Approvals Queue</span>
                </h2>
                <Link to="/purchase-orders" className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-1">
                  <span>View All POs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="erp-table-th">PO Number</th>
                      <th className="erp-table-th">RFQ Title</th>
                      <th className="erp-table-th">Vendor</th>
                      <th className="erp-table-th">Amount</th>
                      <th className="erp-table-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50">
                        <td className="erp-table-td font-mono font-bold text-brand-primary">{po.poNumber}</td>
                        <td className="erp-table-td truncate max-w-[180px]">{po.quotation.rfq.title}</td>
                        <td className="erp-table-td">{po.quotation.vendor.name}</td>
                        <td className="erp-table-td font-medium text-text-primary">
                          ${Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="erp-table-td">
                          <Link to={`/purchase-orders/${po.id}`} className="text-brand-primary font-bold hover:underline inline-flex items-center gap-0.5 text-xs">
                            Review <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {pendingPOs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-text-secondary text-xs">
                          No purchase orders require approval signatures.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest RFQs Table */}
            <div className="bg-bg-card border border-border-default rounded shadow-sm">
              <div className="p-4 border-b border-border-default flex justify-between items-center">
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-brand-primary" />
                  <span>Latest Requests for Quotation</span>
                </h2>
                <Link to="/rfqs" className="text-xs text-brand-primary font-medium hover:underline flex items-center gap-1">
                  <span>View All RFQs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="erp-table-th">RFQ Number</th>
                      <th className="erp-table-th">Title</th>
                      <th className="erp-table-th">Deadline</th>
                      <th className="erp-table-th">Status</th>
                      <th className="erp-table-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestRFQs.map((rfq) => (
                      <tr key={rfq.id} className="hover:bg-slate-50">
                        <td className="erp-table-td font-mono font-bold text-text-secondary">{rfq.rfqNumber}</td>
                        <td className="erp-table-td truncate max-w-[200px]">{rfq.title}</td>
                        <td className="erp-table-td">{new Date(rfq.deadline).toLocaleDateString()}</td>
                        <td className="erp-table-td">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase
                            ${rfq.status === "PUBLISHED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              rfq.status === "DRAFT" ? "bg-slate-100 text-slate-700 border-slate-200" :
                              rfq.status === "UNDER_REVIEW" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-emerald-50 text-emerald-700 border-emerald-200"}
                          `}>
                            {rfq.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="erp-table-td">
                          <Link to={`/rfqs/${rfq.id}`} className="text-brand-primary font-bold hover:underline inline-flex items-center gap-0.5 text-xs">
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {latestRFQs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-text-secondary text-xs">
                          No RFQs created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right: Recent Activities (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-bg-card border border-border-default rounded shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-border-default flex justify-between items-center">
                  <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-primary" />
                    <span>Recent Activity Log</span>
                  </h2>
                </div>

                <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 text-xs">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-text-primary uppercase tracking-wide">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-secondary mt-1 text-[11px]">
                        User <strong className="text-text-primary">{log.user.name}</strong> ({log.user.role}) initiated updates.
                      </p>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-text-secondary py-12 text-xs">
                      No system events recorded.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border-default bg-slate-50/50 text-[10px] text-text-secondary text-center">
                System activities auto-log on modifications.
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDERING FOR VENDORS ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Supplier Console</h1>
          <p className="text-text-secondary text-xs mt-0.5">Manage assignments, submit quotations, and track orders.</p>
        </div>
        <div className="text-xs bg-white border border-border-default px-3 py-1.5 rounded text-text-secondary font-medium">
          Status: <span className="text-brand-success font-bold">APPROVED SUPPLIER</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Assigned RFQs</span>
              <h3 className="text-xl font-bold text-text-primary">{analytics?.rfqCount || 0}</h3>
            </div>
            <div className="w-9 h-9 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Purchase Orders</span>
              <h3 className="text-xl font-bold text-text-primary">{analytics?.poCount || 0}</h3>
            </div>
            <div className="w-9 h-9 rounded bg-brand-success/10 flex items-center justify-center text-brand-success">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-bg-card border border-border-default rounded p-5 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Billing Invoices</span>
              <h3 className="text-xl font-bold text-text-primary">{vendorInvoiceCount}</h3>
            </div>
            <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Invited RFQs */}
        <div className="bg-bg-card border border-border-default rounded shadow-sm">
          <div className="p-4 border-b border-border-default flex justify-between items-center">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Assigned RFQs</h2>
            <Link to="/rfqs" className="text-xs text-brand-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="p-4 space-y-3">
            {vendorRFQs.map(rfq => (
              <div key={rfq.id} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 text-xs">
                <div>
                  <div className="font-semibold text-text-primary">{rfq.title}</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">Deadline: {new Date(rfq.deadline).toLocaleDateString()}</div>
                </div>
                <Link to={`/rfqs/${rfq.id}`} className="text-brand-primary font-bold hover:underline">Bid Now</Link>
              </div>
            ))}
            {vendorRFQs.length === 0 && (
              <div className="text-center text-text-secondary py-6 text-xs">No pending RFQ invites.</div>
            )}
          </div>
        </div>

        {/* Latest POs */}
        <div className="bg-bg-card border border-border-default rounded shadow-sm">
          <div className="p-4 border-b border-border-default flex justify-between items-center">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">Received Purchase Orders</h2>
            <Link to="/purchase-orders" className="text-xs text-brand-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="p-4 space-y-3">
            {vendorPOs.map(po => (
              <div key={po.id} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 text-xs">
                <div>
                  <div className="font-semibold text-text-primary">{po.poNumber}</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">Amount: ${Number(po.totalAmount).toLocaleString()}</div>
                </div>
                <Link to={`/purchase-orders/${po.id}`} className="text-brand-primary font-bold hover:underline">View PO</Link>
              </div>
            ))}
            {vendorPOs.length === 0 && (
              <div className="text-center text-text-secondary py-6 text-xs">No POs received.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
