import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ShieldCheck, Mail, Bell, ToggleLeft, ToggleRight, User as UserIcon, AlertCircle, LogOut } from "lucide-react";

export const Settings: React.FC = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState({
    rfqDispatched: true,
    poApproved: true,
    invoiceSettled: false
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name field cannot be left empty.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/profile", {
        name,
        ...(password ? { password } : {}),
      });
      await checkAuth();
      setSuccess("Profile settings successfully updated.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-border-default pb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">System Settings</h1>
        <p className="text-text-secondary text-xs mt-0.5">Customize notification preferences, manage password policies, and view user metadata.</p>
      </div>

      {success && (
        <div className="bg-brand-success/10 border border-brand-success/20 text-brand-success text-xs p-3.5 rounded flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-brand-error/10 border border-brand-error/20 text-brand-error text-xs p-3.5 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="md:col-span-1 bg-white border border-border-default rounded p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
            Active Identity Card
          </h3>
          
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl mx-auto">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm">{user?.name || "N/A"}</h4>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-text-secondary uppercase mt-1">
                Role: {user?.role || "GUEST"}
              </span>
            </div>
            
            {/* Quick Sign Out Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 border border-brand-danger/20 hover:border-brand-danger/40 rounded text-xs text-brand-danger font-medium hover:bg-red-50/50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-text-secondary border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span>Account Email:</span>
              <strong className="text-text-primary truncate max-w-[120px]">{user?.email || "N/A"}</strong>
            </div>
            <div className="flex justify-between">
              <span>Tenant:</span>
              <strong className="text-text-primary">Global Procurement</strong>
            </div>
          </div>
        </div>

        {/* Configurations Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Form */}
          <form onSubmit={handleSaveSettings} className="bg-white border border-border-default rounded p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
              Update Profile Credentials
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary font-semibold">User Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-slate-50 border border-border-default rounded py-2 pl-9 pr-4 text-text-secondary focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-semibold">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-semibold">Security Level</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={`${user?.role} Access Authorized`}
                    className="w-full bg-slate-50 border border-border-default rounded py-2 px-3 text-text-secondary focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-semibold">Change Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-border-default rounded py-2 px-3 text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-secondary font-semibold">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-border-default rounded py-2 px-3 text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-2 px-4 rounded transition shadow-sm disabled:opacity-50"
              >
                {loading ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </div>
          </form>

          {/* Email Notification Prefs */}
          <div className="bg-white border border-border-default rounded p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-brand-primary" />
              <span>Email Notification Routing</span>
            </h3>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-text-primary">RFQ Dispatch Advisories</h4>
                  <p className="text-text-secondary text-[11px]">Notify immediately when active RFQs are published</p>
                </div>
                <button onClick={() => setNotifs({ ...notifs, rfqDispatched: !notifs.rfqDispatched })}>
                  {notifs.rfqDispatched ? (
                    <ToggleRight className="w-8 h-8 text-brand-primary cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-text-secondary/50 cursor-pointer" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <div>
                  <h4 className="font-semibold text-text-primary">PO Contract Approvals</h4>
                  <p className="text-text-secondary text-[11px]">Notify when purchase order is approved or rejected</p>
                </div>
                <button onClick={() => setNotifs({ ...notifs, poApproved: !notifs.poApproved })}>
                  {notifs.poApproved ? (
                    <ToggleRight className="w-8 h-8 text-brand-primary cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-text-secondary/50 cursor-pointer" />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <div>
                  <h4 className="font-semibold text-text-primary">Payable Settlement Advices</h4>
                  <p className="text-text-secondary text-[11px]">Email notifications when invoices transition to Paid status</p>
                </div>
                <button onClick={() => setNotifs({ ...notifs, invoiceSettled: !notifs.invoiceSettled })}>
                  {notifs.invoiceSettled ? (
                    <ToggleRight className="w-8 h-8 text-brand-primary cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-text-secondary/50 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
