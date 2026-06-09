import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Users, CheckCircle2, ShieldAlert, XCircle, Mail, Phone, Tag } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  rating: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  categories: string[];
  createdAt: string;
}

export const VendorOnboardingList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");

  const fetchVendors = async () => {
    try {
      const res = await api.get(`/vendors?status=${filterStatus}`);
      setVendors(res.data.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to fetch vendor list.");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setError("");
    setSuccess("");
    try {
      await api.patch(`/vendors/${id}/status`, { status: newStatus });
      setSuccess(`Supplier profile successfully ${newStatus.toLowerCase()}.`);
      fetchVendors();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update vendor status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border-default pb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Vendor Directory &amp; Onboarding</h1>
        <p className="text-text-secondary text-xs mt-0.5">Audit supplier credentials, GST registration documents, and authorize ERP access.</p>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white border border-border-default p-3 rounded shadow-sm">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`
              px-3.5 py-1.5 rounded text-xs font-semibold uppercase border transition
              ${filterStatus === status
                ? "bg-brand-primary border-brand-primary text-white"
                : "bg-white border-border-default text-text-secondary hover:text-text-primary hover:bg-slate-50"}
            `}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white border border-border-default rounded p-5 flex flex-col justify-between hover:border-brand-primary/40 transition space-y-5 shadow-sm"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-text-primary">{vendor.name}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="text-[10px] text-text-secondary bg-slate-50 px-2 py-1 rounded border border-border-default font-semibold">
                  Rating: {Number(vendor.rating).toFixed(1)} / 5.0
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-secondary/70" />
                  <span className="text-text-primary">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-secondary/70" />
                  <span className="text-text-primary">{vendor.phone}</span>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded space-y-1 mt-2">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">GST Registration</span>
                  <strong className="text-text-primary font-mono text-xs">{vendor.gstNumber || "Not Provided"}</strong>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded space-y-1">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">Business Address</span>
                  <p className="text-text-secondary text-[11px] leading-relaxed">{vendor.address}</p>
                </div>
              </div>

              {/* Categories */}
              {vendor.categories && vendor.categories.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Business Classifications</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {vendor.categories.map((cat) => (
                      <span key={cat} className="bg-slate-100 text-text-secondary text-[10px] px-2 py-0.5 rounded border border-slate-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Verification Controls */}
            {vendor.status === "PENDING" && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 mt-auto">
                <button
                  onClick={() => handleUpdateStatus(vendor.id, "APPROVED")}
                  className="bg-brand-success hover:bg-brand-success-hover text-white text-xs font-semibold py-2 rounded transition inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Profile</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(vendor.id, "REJECTED")}
                  className="bg-white hover:bg-red-50 text-brand-danger border border-brand-danger/25 text-xs font-semibold py-2 rounded transition inline-flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Profile</span>
                </button>
              </div>
            )}

          </div>
        ))}

        {vendors.length === 0 && (
          <div className="col-span-full bg-white border border-border-default border-dashed rounded p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-text-secondary/40 mx-auto" />
            <h3 className="text-text-primary font-bold text-sm">No Suppliers Found</h3>
            <p className="text-text-secondary text-xs max-w-sm mx-auto">
              There are no suppliers in {filterStatus.toLowerCase()} status directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
