import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, FileText, Download, CheckCircle2, ShieldAlert
} from "lucide-react";

interface ApprovalHistory {
  id: string;
  userName: string;
  action: "APPROVED" | "REJECTED";
  remarks: string | null;
  createdAt: string;
}

interface PODetailsType {
  id: string;
  poNumber: string;
  totalAmount: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  termsAndConditions: string | null;
  remarks: string | null;
  createdAt: string;
  approvedAt: string | null;
  quotation: {
    price: string;
    deliveryTimeline: number;
    remarks: string | null;
    vendor: {
      name: string;
      email: string;
      phone: string;
      address: string;
      gstNumber: string;
    };
    rfq: {
      title: string;
      rfqNumber: string;
    };
    items: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }[];
  };
  invoice: {
    id: string;
    invoiceNumber: string;
  } | null;
  approvals: ApprovalHistory[];
}

export const PODetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [po, setPo] = useState<PODetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Manager Approval States
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!po) return;
    setDownloadLoading(true);
    setError("");
    try {
      const response = await api.get(`/purchase-orders/pdf/po/${po.poNumber}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `po_${po.poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading PO PDF:", err);
      setError("Failed to download Purchase Order PDF.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const fetchPODetails = async () => {
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      setPo(res.data.data);
    } catch (err) {
      console.error("Error fetching PO details:", err);
      setError("Failed to load Purchase Order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetails();
  }, [id]);

  const handleApprovalAction = async (action: "APPROVED" | "REJECTED") => {
    setError("");
    setSuccess("");
    setActionLoading(true);
    try {
      await api.post(`/purchase-orders/${id}/approve`, {
        action,
        remarks,
      });
      setSuccess(`Purchase Order has been ${action.toLowerCase()} successfully.`);
      setRemarks("");
      fetchPODetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit approval decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-slate-100 text-slate-700 border-slate-200";
      case "PENDING_APPROVAL": return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center text-text-secondary py-12">
        <ShieldAlert className="w-10 h-10 text-text-secondary/50 mx-auto mb-2" />
        <p>Purchase Order could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/purchase-orders")}
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      {/* Header panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border-default p-5 rounded shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">{po.poNumber}</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(po.status)}`}>
              {po.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-base font-bold text-text-primary">{po.quotation.rfq.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {po.status === "APPROVED" && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadLoading ? "Downloading..." : "Download PO PDF"}</span>
            </button>
          )}
          {po.invoice && (
            <Link
              to={`/invoices/${po.invoice.id}`}
              className="bg-white hover:bg-slate-50 text-text-primary text-xs font-semibold px-3.5 py-2 rounded border border-border-default transition inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View Invoice ({po.invoice.invoiceNumber})</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs p-3.5 rounded flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-brand-success/10 border border-brand-success/20 text-brand-success text-xs p-3.5 rounded flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: PO Contract Sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Official Sheet */}
          <div className="bg-white border border-border-default rounded p-6 md:p-8 shadow-sm space-y-6 border-t-4 border-t-brand-primary">
            
            <div className="flex justify-between items-start border-b border-border-default pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">PURCHASE ORDER CONTRACT</h2>
                <p className="text-xs text-text-secondary mt-0.5">PO Number: <span className="font-mono text-brand-primary font-semibold">{po.poNumber}</span></p>
              </div>
              <div className="text-right text-xs text-text-secondary">
                <div>Date Issued: {new Date(po.createdAt).toLocaleDateString()}</div>
                <div>RFQ Ref: {po.quotation.rfq.rfqNumber}</div>
              </div>
            </div>

            {/* Parties Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 text-xs text-text-secondary">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Buyer Information</h4>
                <p className="font-bold text-text-primary">VendorBridge Enterprise Corp</p>
                <p>Email: procurement@vendorbridge.com</p>
                <p>Address: Tech Hub, Building C, Suite 400</p>
              </div>
              
              <div className="space-y-1 md:border-l border-border-default md:pl-6">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Vendor / Supplier</h4>
                <p className="font-bold text-text-primary">{po.quotation.vendor.name}</p>
                <p>GSTIN: {po.quotation.vendor.gstNumber}</p>
                <p>Email: {po.quotation.vendor.email}</p>
                <p>Address: {po.quotation.vendor.address}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-default pb-1">
                Contract Line Items
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-default text-text-secondary bg-slate-50">
                      <th className="py-2 px-3 font-semibold">Description</th>
                      <th className="py-2 px-3 text-center font-semibold">Quantity</th>
                      <th className="py-2 px-3 text-right font-semibold">Unit Price</th>
                      <th className="py-2 px-3 text-right font-semibold">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.quotation.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 text-text-primary">
                        <td className="py-2.5 px-3 font-medium">{item.description}</td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-brand-primary">${Number(item.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Row */}
              <div className="flex justify-end pt-3">
                <div className="w-52 text-xs space-y-1.5 text-text-secondary border-t border-border-default pt-2.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-text-primary font-medium">${Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-text-primary font-bold text-sm border-t border-slate-100 pt-1.5">
                    <span>Total Amount:</span>
                    <span className="text-brand-primary">${Number(po.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {po.termsAndConditions && (
              <div className="bg-slate-50 border border-border-default p-4 rounded space-y-1 text-xs">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Contractual Terms &amp; Conditions</h3>
                <p className="text-text-secondary leading-relaxed">{po.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* Approval Action Form (Managers/Admins) */}
          {po.status === "PENDING_APPROVAL" && (user?.role === "MANAGER" || user?.role === "ADMIN") && (
            <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Manager Evaluation &amp; Authorization</h3>
                <p className="text-text-secondary text-xs mt-0.5">Authorize or decline this contract. Add remarks below.</p>
              </div>

              <div className="space-y-3">
                <textarea
                  placeholder="Justification remarks (e.g. Budget approved, contract items validated. Approved for execution.)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-border-default rounded p-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleApprovalAction("APPROVED")}
                    disabled={actionLoading}
                    className="bg-brand-success hover:bg-brand-success-hover text-white text-xs font-semibold py-2 rounded transition disabled:opacity-50"
                  >
                    Approve &amp; Dispatch PO
                  </button>
                  <button
                    onClick={() => handleApprovalAction("REJECTED")}
                    disabled={actionLoading}
                    className="bg-brand-danger hover:bg-brand-danger-hover text-white text-xs font-semibold py-2 rounded transition disabled:opacity-50"
                  >
                    Decline Purchase Order
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Approvals Timeline */}
        <div className="space-y-6">
          <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
              Approvals Log Trail
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {po.approvals.map((app) => (
                <div key={app.id} className="flex gap-2.5 text-xs items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${app.action === 'APPROVED' ? 'bg-brand-success' : 'bg-brand-danger'}`}></div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary">
                      <strong className="text-text-primary">{app.userName}</strong>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      Decision: <span className={app.action === 'APPROVED' ? 'text-brand-success' : 'text-brand-danger'}>{app.action}</span>
                    </div>
                    {app.remarks && (
                      <p className="text-text-secondary bg-slate-50 p-2 rounded border border-border-default mt-1 text-[10px] leading-relaxed">
                        "{app.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {po.approvals.length === 0 && (
                <div className="text-center text-text-secondary text-xs py-8">
                  No approval history recorded. Awaiting manager review action.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
