import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { Building2, User, Mail, Lock, Phone, MapPin, Hash, CheckSquare, ShieldCheck, ShieldAlert } from "lucide-react";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    gstNumber: "",
    address: "",
    categories: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "VENDOR",
        vendorDetails: {
          name: formData.companyName,
          phone: formData.phone,
          gstNumber: formData.gstNumber,
          address: formData.address,
          categories: formData.categories.split(",").map((c) => c.trim()).filter(Boolean),
        },
      };

      await api.post("/auth/signup", payload);
      setSuccess("Your registration request has been submitted successfully! Your account will be active once approved by our administrator.");
      
      setFormData({
        name: "",
        email: "",
        password: "",
        companyName: "",
        phone: "",
        gstNumber: "",
        address: "",
        categories: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check the inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white border border-border-default rounded p-6 md:p-8 shadow-sm space-y-5">
        
        <div className="flex items-center justify-center border-b border-slate-100 pb-4">
          <span className="text-lg font-bold tracking-tight text-brand-primary font-display">Supplier Onboarding Portal</span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-text-primary tracking-tight font-display">Create Vendor Profile</h1>
          <p className="text-text-secondary text-xs">Submit your legal corporate details for onboarding evaluation</p>
        </div>

        {error && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs p-3 rounded flex items-start gap-2 animate-fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-brand-success/10 border border-brand-success/20 text-brand-success text-xs p-3.5 rounded flex items-start gap-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Contact Person Details
              </h3>
              
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contact person's name"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-1.5">
                Corporate Details
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Company Legal Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corporation Ltd"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">GSTIN / Tax Registration No.</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="gstNumber"
                    required
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-semibold">Business Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1-555-0144"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Scope of Supply &amp; Location
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Business Categories (Comma separated)</label>
              <div className="relative">
                <CheckSquare className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  name="categories"
                  required
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="Electronics, IT Hardware, Office Supplies, Logistics"
                  className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold">Full Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Building, Suite, City, ZIP State"
                  className="w-full bg-white border border-border-default rounded p-2.5 pl-9 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded py-2.5 flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs shadow-sm mt-3"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <span>Submit Registration Request</span>
            )}
          </button>

          <div className="text-center text-xs text-text-secondary pt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-primary hover:underline font-semibold">
              Sign In here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
