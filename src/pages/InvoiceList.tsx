import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Calendar, DollarSign, ChevronRight, Search, Inbox } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  taxAmount: string;
  totalAmount: string;
  status: "UNPAID" | "PAID";
  dueDate: string;
  createdAt: string;
  purchaseOrder: {
    poNumber: string;
    quotation: {
      vendor: {
        name: string;
      };
      rfq: {
        title: string;
      };
    };
  };
}

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get("/purchase-orders/invoices");
        setInvoices(res.data.data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNPAID": return "bg-red-50 text-red-700 border-red-200";
      case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = filterStatus === "ALL" || inv.status === filterStatus;
    const invoiceNum = inv.invoiceNumber || "";
    const poNum = inv.purchaseOrder?.poNumber || "";
    const rfqTitle = inv.purchaseOrder?.quotation?.rfq?.title || "";
    const vendorName = inv.purchaseOrder?.quotation?.vendor?.name || "";

    const matchesSearch = invoiceNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          poNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Invoices &amp; Accounts Payable</h1>
          <p className="text-text-secondary text-xs mt-0.5">Track billing history, verify tax assessments, and review treasury disbursements.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border-default p-4 rounded shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1">
          {["ALL", "UNPAID", "PAID"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-3.5 py-1.5 rounded text-xs font-semibold uppercase transition border
                ${filterStatus === status
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "bg-white border-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50"}
              `}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search Invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* Invoice List Grid */}
      <div className="grid gap-3">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id}
            onClick={() => navigate(`/invoices/${inv.id}`)}
            className="bg-white border border-border-default rounded p-4 hover:border-brand-primary/40 hover:bg-slate-50/50 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider">{inv.invoiceNumber}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(inv.status)}`}>
                  {inv.status}
                </span>
                {inv.purchaseOrder?.poNumber && (
                  <span className="text-[10px] text-text-secondary font-mono">PO Ref: {inv.purchaseOrder.poNumber}</span>
                )}
              </div>
              <h2 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition truncate">
                {inv.purchaseOrder?.quotation?.rfq?.title || "RFQ Reference N/A"}
              </h2>
              <p className="text-text-secondary text-xs">
                Supplier: <strong className="text-text-primary">{inv.purchaseOrder?.quotation?.vendor?.name || "N/A"}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary shrink-0 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>Due: <strong className="text-text-primary">{new Date(inv.dueDate).toLocaleDateString()}</strong></span>
              </div>

              <div className="flex items-center gap-0.5">
                <DollarSign className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-xs font-bold text-brand-primary">${Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-brand-primary transition hidden md:block" />
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="bg-white border border-border-default border-dashed rounded p-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-text-secondary/40 mx-auto" />
            <h3 className="text-text-primary font-bold text-sm">No Invoices Found</h3>
            <p className="text-text-secondary text-xs max-w-sm mx-auto">
              There are no Invoice records fitting the selected criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
