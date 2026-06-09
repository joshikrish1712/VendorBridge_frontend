import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-white font-display">Access Denied</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your active user role does not possess permissions to view this secure directory. If you require access, please contact the system administrator.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
