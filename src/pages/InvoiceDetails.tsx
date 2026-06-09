import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, FileText, Download, ShieldAlert, CreditCard } from "lucide-react";

interface InvoiceDetailsType {
  id: string;
  invoiceNumber: string;
  amount: string;
  taxAmount: string;
  totalAmount: string;
  status: "UNPAID" | "PAID";
  dueDate: string;
  createdAt: string;
  purchaseOrder: {
    id: string;
    poNumber: string;
    termsAndConditions: string | null;
    quotation: {
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
  };
}

export const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<InvoiceDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloadLoading(true);
    setError("");
    try {
      const response = await api.get(`/purchase-orders/pdf/invoice/${invoice.invoiceNumber}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading Invoice PDF:", err);
      setError("Failed to download Invoice PDF.");
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const res = await api.get(`/purchase-orders/invoices/${id}`);
        setInvoice(res.data.data);
      } catch (err) {
        console.error("Error fetching invoice details:", err);
        setError("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNPAID": return "bg-red-50 text-red-700 border-red-200";
      case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200";
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

  if (!invoice) {
    return (
      <div className="text-center text-text-secondary py-12">
        <ShieldAlert className="w-10 h-10 text-text-secondary/50 mx-auto mb-2" />
        <p>Invoice details could not be found.</p>
      </div>
    );
  }

  const poData = invoice.purchaseOrder;
  const vendor = poData.quotation.vendor;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/invoices")}
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border-default p-5 rounded shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">{invoice.invoiceNumber}</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <h1 className="text-base font-bold text-text-primary">Invoice Settlement Overview</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadLoading}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadLoading ? "Downloading..." : "Download Invoice PDF"}</span>
          </button>
          <Link
            to={`/purchase-orders/${poData.id}`}
            className="bg-white hover:bg-slate-50 text-text-primary text-xs font-semibold px-3.5 py-2 rounded border border-border-default transition inline-flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>View PO ({poData.poNumber})</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs p-3.5 rounded flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Invoice Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Lines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Parties information */}
          <div className="bg-white border border-border-default p-5 rounded shadow-sm grid md:grid-cols-2 gap-6 text-xs text-text-secondary">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Billed To (Buyer)</h4>
              <p className="font-bold text-text-primary">VendorBridge Enterprise Corp</p>
              <p>Email: accounts-payable@vendorbridge.com</p>
              <p>Address: Tech Hub, Building C, Suite 400</p>
            </div>
            
            <div className="space-y-1 md:border-l border-border-default md:pl-6">
              <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Billed By (Vendor)</h4>
              <p className="font-bold text-text-primary">{vendor.name}</p>
              <p>GSTIN: {vendor.gstNumber}</p>
              <p>Email: {vendor.email}</p>
              <p>Address: {vendor.address}</p>
            </div>
          </div>

          {/* Line items list */}
          <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
              Invoice Line Items
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
                  {poData.quotation.items.map((item) => (
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

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-3">
              <div className="w-56 text-xs space-y-2 text-text-secondary border-t border-border-default pt-3">
                <div className="flex justify-between">
                  <span>Taxable Value (Base):</span>
                  <span className="text-text-primary font-medium">${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Amount (18%):</span>
                  <span className="text-text-primary font-medium">${Number(invoice.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-text-primary font-bold text-sm border-t border-slate-100 pt-2">
                  <span>Total Amount (Net):</span>
                  <span className="text-brand-primary">${Number(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Settlement Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
              Settlement &amp; Terms
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-border-default p-3 rounded space-y-1">
                <span className="text-text-secondary block">Net Payment Due Date</span>
                <strong className="text-text-primary text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</strong>
              </div>

              <div className="bg-slate-50 border border-border-default p-3 rounded space-y-1">
                <span className="text-text-secondary block">Bank Details</span>
                <p className="text-text-secondary leading-relaxed font-mono text-[10px]">
                  Beneficiary Name: {vendor.name}<br/>
                  Routing: WIRE-99882<br/>
                  Account: VEND-{poData.poNumber.split("-")[2]}
                </p>
              </div>

              {invoice.status === "UNPAID" && (
                <div className="flex gap-2.5 items-start bg-brand-danger/5 border border-brand-danger/15 p-3 rounded text-brand-danger text-[10.5px]">
                  <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Awaiting Treasury approval signature. Payment processed on Net 30 terms.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
