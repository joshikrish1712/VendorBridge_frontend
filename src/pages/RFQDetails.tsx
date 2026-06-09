import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, Calendar, CheckCircle2, ShieldAlert, 
  Trash2, Plus, Sparkles 
} from "lucide-react";

interface RFQItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface AssignedVendor {
  id: string;
  status: string;
  vendor: {
    name: string;
    email: string;
  };
}

interface Quotation {
  id: string;
  price: string;
  deliveryTimeline: number;
  remarks: string | null;
  createdAt: string;
  vendorId: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }[];
}

interface RFQDetailsType {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  deadline: string;
  status: "DRAFT" | "PUBLISHED" | "UNDER_REVIEW" | "CLOSED" | "COMPLETED";
  createdAt: string;
  assignedVendors: AssignedVendor[];
  quotations: Quotation[];
}

export const RFQDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rfq, setRfq] = useState<RFQDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Quotation Submission state (Vendor)
  const [deliveryTimeline, setDeliveryTimeline] = useState<number>(7);
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<RFQItem[]>([
    { description: "", quantity: 1, unitPrice: 0 }
  ]);

  const fetchRFQDetails = async () => {
    try {
      const res = await api.get(`/rfqs/${id}`);
      setRfq(res.data.data);
    } catch (err) {
      console.error("Error fetching RFQ details:", err);
      setError("Failed to load RFQ details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRFQDetails();
    }, 100);
    return () => clearTimeout(timer);
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setError("");
      setSuccess("");
      await api.patch(`/rfqs/${id}/status`, { status: newStatus });
      setSuccess(`RFQ status updated to ${newStatus} successfully.`);
      fetchRFQDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update RFQ status.");
    }
  };

  const handleItemChange = (index: number, field: keyof RFQItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value)
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  };

  const handleQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emptyDesc = items.some((item) => !item.description.trim());
    if (emptyDesc) {
      setError("Please describe all items in your bidding list.");
      return;
    }
    const invalidVal = items.some((item) => item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidVal) {
      setError("Quantity and Unit Price must be greater than zero.");
      return;
    }

    try {
      const payload = {
        rfqId: id,
        deliveryTimeline,
        remarks,
        items
      };
      await api.post("/quotations", payload);
      setSuccess("Your quotation has been submitted successfully.");
      fetchRFQDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit quotation.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="text-center text-text-secondary py-12">
        <ShieldAlert className="w-10 h-10 text-text-secondary/50 mx-auto mb-2" />
        <p>RFQ details could not be found.</p>
      </div>
    );
  }

  const vendorQuotation = user?.role === "VENDOR" 
    ? rfq.quotations.find((q) => q.vendorId === user.vendorProfileId)
    : null;

  const isDeadlinePassed = new Date() > new Date(rfq.deadline);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-slate-100 text-slate-700 border-slate-200";
      case "PUBLISHED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNDER_REVIEW": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CLOSED": return "bg-red-50 text-red-700 border-red-200";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/rfqs")}
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border-default p-5 rounded shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">{rfq.rfqNumber}</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusBadgeColor(rfq.status)}`}>
              {rfq.status.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-lg font-bold text-text-primary">{rfq.title}</h1>
        </div>

        {/* Action Controls for Procurement Officer & Admin */}
        {(user?.role === "PROCUREMENT" || user?.role === "ADMIN") && (
          <div className="flex flex-wrap gap-2">
            {rfq.status === "DRAFT" && (
              <button
                onClick={() => handleUpdateStatus("PUBLISHED")}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-3 py-2 rounded transition"
              >
                Publish RFQ
              </button>
            )}
            {rfq.status === "PUBLISHED" && (
              <button
                onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                className="bg-brand-warning hover:bg-brand-warning-hover text-white text-xs font-semibold px-3 py-2 rounded transition"
              >
                Close Bidding (Review Bids)
              </button>
            )}
            {rfq.status !== "DRAFT" && rfq.quotations.length > 0 && (
              <Link
                to={`/rfqs/${rfq.id}/compare`}
                className="bg-brand-success hover:bg-brand-success-hover text-white text-xs font-semibold px-3 py-2 rounded transition inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>Compare Quotations</span>
              </Link>
            )}
          </div>
        )}
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

      {/* Details Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Scope & bidding form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Specifications Card */}
          <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
              Scope of Supply &amp; Specifications
            </h3>
            <p className="text-text-primary text-xs leading-relaxed whitespace-pre-line">
              {rfq.description}
            </p>
            
            <div className="flex items-center gap-6 pt-3 border-t border-border-default text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <span>Bidding Deadline: <strong className="text-text-primary">{new Date(rfq.deadline).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Vendor Bidding Proposal Panel */}
          {user?.role === "VENDOR" && (
            <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-5">
              
              {vendorQuotation ? (
                /* Show existing quotation in ALL states */
                <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-4">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Quotation Submitted Successfully</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-text-secondary block">Proposed Price</span>
                      <strong className="text-text-primary text-sm">${Number(vendorQuotation.price).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-text-secondary block">Delivery Timeline</span>
                      <strong className="text-text-primary text-sm">{vendorQuotation.deliveryTimeline} Days</strong>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-3 text-xs">
                    <span className="text-text-secondary block font-semibold mb-2 uppercase tracking-wide text-[10px]">Itemized Breakdown</span>
                    <div className="space-y-1.5">
                      {vendorQuotation.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-text-primary">
                          <span>{item.description} (x{item.quantity})</span>
                          <strong className="text-text-primary">${Number(item.totalPrice).toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : rfq.status === "PUBLISHED" && !isDeadlinePassed ? (
                /* Show the bidding form only when PUBLISHED and deadline not passed */
                <>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Submit Bidding Quotation</h3>
                    <p className="text-text-secondary text-xs mt-0.5">Define your supply pricing list and delivery days.</p>
                  </div>

                  <form onSubmit={handleQuotationSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold">Delivery Timeline (Days)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={deliveryTimeline}
                          onChange={(e) => setDeliveryTimeline(Number(e.target.value))}
                          className="w-full bg-white border border-border-default rounded py-2 px-3 text-text-primary focus:outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold">Total Quote Amount</label>
                        <div className="w-full bg-slate-50 border border-border-default rounded py-2 px-3 text-brand-primary font-bold text-xs flex items-center">
                          ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary font-semibold">Remarks / Logistics notes</label>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g., Shipping included in pricing. Subject to immediate contract signing."
                        className="w-full bg-white border border-border-default rounded py-2 px-3 text-text-primary focus:outline-none focus:border-brand-primary text-xs"
                      />
                    </div>

                    {/* Bidding Items */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Line Items Pricing</label>
                      
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              required
                              placeholder="Item description (e.g. Model XY Laptop)"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              className="col-span-6 bg-white border border-border-default rounded py-2 px-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
                            />
                            <input
                              type="number"
                              required
                              min={1}
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="col-span-2 bg-white border border-border-default rounded py-2 px-2 text-xs text-text-primary text-center focus:outline-none focus:border-brand-primary"
                            />
                            <input
                              type="number"
                              required
                              min={0.01}
                              step="0.01"
                              placeholder="Unit Price"
                              value={item.unitPrice || ""}
                              onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                              className="col-span-3 bg-white border border-border-default rounded py-2 px-2 text-xs text-text-primary text-center focus:outline-none focus:border-brand-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="col-span-1 text-brand-danger hover:bg-red-50 p-2 text-center rounded"
                              disabled={items.length === 1}
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Line Item</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-2.5 rounded transition shadow-sm"
                    >
                      Submit Bidding Proposal
                    </button>
                  </form>
                </>
              ) : rfq.status === "PUBLISHED" && isDeadlinePassed ? (
                <div className="bg-red-50 border border-red-200 p-5 rounded text-center space-y-1">
                  <ShieldAlert className="w-6 h-6 text-red-400 mx-auto" />
                  <p className="text-red-700 text-xs font-bold uppercase tracking-wide">Bidding Deadline Passed</p>
                  <p className="text-red-600 text-xs">The submission window for this RFQ closed on {new Date(rfq.deadline).toLocaleString()}.</p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-border-default p-5 rounded text-center space-y-1">
                  <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-text-primary text-xs font-bold uppercase tracking-wide">Bidding {rfq.status === "UNDER_REVIEW" ? "Under Review" : "Closed"}</p>
                  <p className="text-text-secondary text-xs">This RFQ is currently in <span className="font-bold uppercase text-brand-primary">{rfq.status.replace(/_/g, " ")}</span> state. New proposals are no longer accepted.</p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: Bid matrices / invites */}
        <div className="space-y-6">
          {user?.role !== "VENDOR" && (
            <>
              {/* Quotations List */}
              <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
                  Bids Received ({rfq.quotations.length})
                </h3>
                
                <div className="space-y-2.5">
                  {rfq.quotations.map((quote) => {
                    const vendorName = rfq.assignedVendors.find((av) => av.id === quote.vendorId)?.vendor.name || "Vendor";
                    return (
                      <div key={quote.id} className="bg-slate-50 border border-border-default p-3 rounded space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <strong className="text-text-primary">{vendorName}</strong>
                          <span className="font-bold text-brand-primary">${Number(quote.price).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-text-secondary">
                          <span>Timeline: {quote.deliveryTimeline} days</span>
                          <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                  {rfq.quotations.length === 0 && (
                    <div className="text-center text-text-secondary text-xs py-4">
                      No quotations received yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Invited Vendors */}
              <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-border-default pb-2">
                  Invited Suppliers ({rfq.assignedVendors.length})
                </h3>

                <div className="space-y-2">
                  {rfq.assignedVendors.map((av) => (
                    <div key={av.id} className="flex justify-between items-center text-xs p-2 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-semibold text-text-primary">{av.vendor.name}</div>
                        <div className="text-[10px] text-text-secondary">{av.vendor.email}</div>
                      </div>
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded text-text-secondary border border-border-default font-bold uppercase tracking-wider">
                        {av.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
