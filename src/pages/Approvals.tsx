import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { CheckSquare, Users, ArrowRight } from "lucide-react";

interface PendingPO {
  id: string;
  poNumber: string;
  totalAmount: string;
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

interface PendingVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
}

export const Approvals: React.FC = () => {
  const [pendingPOs, setPendingPOs] = useState<PendingPO[]>([]);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"POS" | "VENDORS">("POS");

  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        const [posRes, vendorsRes] = await Promise.all([
          api.get("/purchase-orders"),
          api.get("/vendors?status=PENDING")
        ]);
        
        // Filter pending POs
        const pos = posRes.data.data || [];
        setPendingPOs(pos.filter((p: any) => p.status === "PENDING_APPROVAL"));
        
        setPendingVendors(vendorsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching pending approvals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border-default pb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">System Approvals Queue</h1>
        <p className="text-text-secondary text-xs mt-0.5">Evaluate and authorize contracts, sign purchase agreements, and verify supplier credentials.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-border-default p-3 rounded shadow-sm">
        <button
          onClick={() => setActiveTab("POS")}
          className={`
            px-4 py-1.5 rounded text-xs font-semibold uppercase border transition
            ${activeTab === "POS" 
              ? "bg-brand-primary border-brand-primary text-white" 
              : "bg-white border-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50"}
          `}
        >
          Purchase Orders ({pendingPOs.length})
        </button>
        <button
          onClick={() => setActiveTab("VENDORS")}
          className={`
            px-4 py-1.5 rounded text-xs font-semibold uppercase border transition
            ${activeTab === "VENDORS" 
              ? "bg-brand-primary border-brand-primary text-white" 
              : "bg-white border-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50"}
          `}
        >
          Vendor Profiles ({pendingVendors.length})
        </button>
      </div>

      {activeTab === "POS" ? (
        <div className="bg-white border border-border-default rounded shadow-sm">
          <div className="p-4 border-b border-border-default flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-brand-primary" />
              <span>Purchase Orders Awaiting Authorization</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="erp-table-th">PO Number</th>
                  <th className="erp-table-th">RFQ Subject</th>
                  <th className="erp-table-th">Supplier Name</th>
                  <th className="erp-table-th">Grand Total</th>
                  <th className="erp-table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="erp-table-td font-mono font-bold text-brand-primary">{po.poNumber}</td>
                    <td className="erp-table-td truncate max-w-[200px]">{po.quotation.rfq.title}</td>
                    <td className="erp-table-td">{po.quotation.vendor.name}</td>
                    <td className="erp-table-td font-bold text-text-primary">${Number(po.totalAmount).toLocaleString()}</td>
                    <td className="erp-table-td text-right">
                      <Link to={`/purchase-orders/${po.id}`} className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline">
                        <span>Evaluate &amp; Sign</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {pendingPOs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-secondary text-xs">
                      No purchase orders require approval at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-border-default rounded shadow-sm">
          <div className="p-4 border-b border-border-default flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>Supplier Registrations Awaiting Verification</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="erp-table-th">Company Name</th>
                  <th className="erp-table-th">Email</th>
                  <th className="erp-table-th">Phone</th>
                  <th className="erp-table-th">GSTIN Number</th>
                  <th className="erp-table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50">
                    <td className="erp-table-td font-bold text-text-primary">{vendor.name}</td>
                    <td className="erp-table-td">{vendor.email}</td>
                    <td className="erp-table-td">{vendor.phone}</td>
                    <td className="erp-table-td font-mono font-bold text-text-secondary">{vendor.gstNumber || "N/A"}</td>
                    <td className="erp-table-td text-right">
                      <Link to="/vendor-onboarding" className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline">
                        <span>Verify supplier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {pendingVendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-secondary text-xs">
                      No vendor applications are pending evaluation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
