import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ClipboardList, Calendar, Users, ShieldAlert, ArrowLeft } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
}

export const RFQCreate: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApprovedVendors = async () => {
      try {
        const res = await api.get("/vendors?status=APPROVED");
        setVendors(res.data.data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };
    fetchApprovedVendors();
  }, []);

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedVendors.length === 0) {
      setError("Please assign at least one supplier vendor to this RFQ.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        vendorIds: selectedVendors,
      };

      await api.post("/rfqs", payload);
      navigate("/rfqs");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create RFQ. Ensure deadline is in the future.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/rfqs")}
        className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      <div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Create Request for Quotation</h1>
        <p className="text-text-secondary text-xs mt-0.5">Submit request specifications and select vendor bidders.</p>
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs p-3.5 rounded flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-border-default rounded p-6 md:p-8 space-y-5 shadow-sm">
        
        {/* RFQ Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">RFQ Title / Subject</label>
          <div className="relative">
            <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              required
              placeholder="e.g., Supply of Office Laptops (Core i7, 16GB RAM)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
            />
          </div>
        </div>

        {/* Detailed Scope */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Scope of Work &amp; Specifications</label>
          <textarea
            required
            rows={5}
            placeholder="Outline structural parameters, delivery conditions, quantities, technical requirements, and GST criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-border-default rounded p-3 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition resize-none"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Submission Deadline</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
            />
          </div>
          <span className="text-[10px] text-text-secondary block">Must be set to a date and time in the future.</span>
        </div>

        {/* Target Suppliers */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-text-secondary" />
            <span>Target Suppliers ({selectedVendors.length} selected)</span>
          </label>
          
          <div className="bg-slate-50 border border-border-default rounded p-3 max-h-[160px] overflow-y-auto space-y-1.5">
            {vendors.map((vendor) => {
              const isChecked = selectedVendors.includes(vendor.id);
              return (
                <label
                  key={vendor.id}
                  className={`
                    flex items-center gap-3 p-2 rounded cursor-pointer transition border
                    ${isChecked 
                      ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary" 
                      : "bg-white border-border-default text-text-secondary hover:text-text-primary"}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleVendorToggle(vendor.id)}
                    className="w-3.5 h-3.5 rounded accent-brand-primary text-white cursor-pointer"
                  />
                  <div>
                    <div className="font-semibold text-xs text-text-primary">{vendor.name}</div>
                    <div className="text-[10px] text-text-secondary">{vendor.email}</div>
                  </div>
                </label>
              );
            })}
            {vendors.length === 0 && (
              <div className="text-center text-text-secondary text-xs py-4">
                No active approved vendors found in database.
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded py-2.5 flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          ) : (
            <span>Publish Request for Bidding</span>
          )}
        </button>
      </form>
    </div>
  );
};
