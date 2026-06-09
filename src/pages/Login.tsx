import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ShieldAlert, ArrowRight, Activity, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";
import api from "../utils/api";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot / Reset password state
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: resetEmail });
      setSuccessMessage(res.data.data?.message || res.data.message || "OTP code sent successfully.");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: resetEmail });
      setSuccessMessage(res.data.data?.message || res.data.message || "A new OTP code has been sent.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (otp.length !== 6) {
      setError("OTP must be a 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: resetEmail,
        otp,
        password: newPassword
      });
      setMode("login");
      setSuccessMessage(res.data.data?.message || res.data.message || "Password reset successfully. Sign in with your new password.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please check the OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-center">
        
        {/* Branding Column */}
        <div className="md:col-span-5 text-left space-y-5 hidden md:block">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-brand-primary font-display">VendorBridge</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary leading-tight font-display">
            Enterprise Procurement &amp; Supplier Portal
          </h2>
          <p className="text-text-secondary text-xs leading-relaxed">
            A secure platform facilitating real-time bidding, automated PO distribution, contract evaluations, invoicing settlement, and detailed log tracking.
          </p>
          <div className="space-y-2 pt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-primary" />
              <span>Full lifecycle procurement tracking system</span>
            </div>
          </div>
        </div>

        {/* Login Form Column */}
        <div className="md:col-span-7 bg-white border border-border-default rounded p-6 md:p-8 shadow-sm space-y-5">
          {mode === "login" && (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Sign In</h1>
                <p className="text-text-secondary text-xs">Enter your authorization credentials to access the ERP</p>
              </div>

              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs p-3 rounded flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-brand-success/10 border border-brand-success/25 text-brand-success text-xs p-3 rounded flex items-start gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-success" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      required
                      placeholder="name@vendorbridge.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setSuccessMessage("");
                        setMode("forgot");
                        setResetEmail(email);
                      }}
                      className="text-xs font-semibold text-brand-primary hover:underline focus:outline-none cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded py-2.5 flex items-center justify-center gap-1.5 transition disabled:opacity-50 text-xs shadow-sm mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <span>Access Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Logins */}
              <div className="border-t border-slate-100 pt-5 space-y-2.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block text-center md:text-left">
                  Quick Sandbox Logins
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickLogin("admin@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    🔑 Admin
                  </button>
                  <button
                    onClick={() => handleQuickLogin("officer@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    👔 Officer
                  </button>
                  <button
                    onClick={() => handleQuickLogin("manager@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    📈 Manager
                  </button>
                  <button
                    onClick={() => handleQuickLogin("vendor-a@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    🏢 Vendor A (Appr.)
                  </button>
                  <button
                    onClick={() => handleQuickLogin("vendor-b@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    🏢 Vendor B (Appr.)
                  </button>
                  <button
                    onClick={() => handleQuickLogin("vendor-c@vendorbridge.com")}
                    className="bg-slate-50 hover:bg-slate-100 border border-border-default text-[10px] font-semibold text-text-primary py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    ⏳ Vendor C (Pend.)
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-text-secondary pt-2">
                Are you a new vendor?{" "}
                <Link to="/register" className="text-brand-primary hover:underline font-semibold font-sans">
                  Onboard Supplier Account
                </Link>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Forgot Password</h1>
                <p className="text-text-secondary text-xs">Enter your email address to receive a 6-digit OTP verification code</p>
              </div>

              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs p-3 rounded flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      required
                      placeholder="name@vendorbridge.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded py-2.5 flex items-center justify-center gap-1.5 transition disabled:opacity-50 text-xs shadow-sm cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("login");
                  }}
                  className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center justify-center gap-1 mx-auto focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </>
          )}

          {mode === "reset" && (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Reset Password</h1>
                <p className="text-text-secondary text-xs">Enter the 6-digit OTP code sent to <strong>{resetEmail}</strong> and your new password</p>
              </div>

              {error && (
                <div className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs p-3 rounded flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-brand-success/10 border border-brand-success/25 text-brand-success text-xs p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-success" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Verification OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition tracking-[0.25em] font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-border-default rounded py-2.5 pl-9 pr-4 text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded py-2.5 flex items-center justify-center gap-1.5 transition disabled:opacity-50 text-xs shadow-sm cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-brand-primary hover:underline focus:outline-none cursor-pointer"
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setMode("login");
                  }}
                  className="font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
