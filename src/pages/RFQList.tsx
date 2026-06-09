import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Calendar, ChevronRight, Inbox, Tag, Search } from "lucide-react";

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  deadline: string;
  status: "DRAFT" | "PUBLISHED" | "UNDER_REVIEW" | "CLOSED" | "COMPLETED";
  createdAt: string;
  _count?: {
    quotations: number;
  };
}

export const RFQList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const res = await api.get("/rfqs");
        setRfqs(res.data.data);
      } catch (error) {
        console.error("Error fetching RFQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-slate-100 text-slate-700 border-slate-200";
      case "PUBLISHED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNDER_REVIEW": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CLOSED": return "bg-red-50 text-red-700 border-red-200";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredRfqs = rfqs.filter((r) => {
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
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
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Requests for Quotation</h1>
          <p className="text-text-secondary text-xs mt-0.5">Manage active biddings, invite suppliers, and review proposals.</p>
        </div>
        {(user?.role === "PROCUREMENT" || user?.role === "ADMIN") && (
          <Link
            to="/rfqs/create"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded font-semibold transition text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New RFQ</span>
          </Link>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border-default p-4 rounded shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1">
          {["ALL", "DRAFT", "PUBLISHED", "UNDER_REVIEW", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-3 py-1.5 rounded text-xs font-semibold uppercase transition border
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
            placeholder="Search RFQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border-default rounded py-2 pl-9 pr-4 text-xs text-text-primary focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* RFQ Listings */}
      <div className="grid gap-3">
        {filteredRfqs.map((rfq) => (
          <div
            key={rfq.id}
            onClick={() => navigate(`/rfqs/${rfq.id}`)}
            className="bg-white border border-border-default rounded p-4 hover:border-brand-primary/40 hover:bg-slate-50/50 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider">{rfq.rfqNumber}</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(rfq.status)}`}>
                  {rfq.status.replace(/_/g, " ")}
                </span>
                {user?.role === "VENDOR" && rfq.status === "PUBLISHED" && new Date(rfq.deadline) > new Date() && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                    Open for Bidding
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition">
                {rfq.title}
              </h2>
              <p className="text-text-secondary text-xs line-clamp-1 pr-6">{rfq.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>Deadline: <strong className="text-text-primary">{new Date(rfq.deadline).toLocaleDateString()}</strong></span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-text-secondary" />
                <span>Bids: <strong className="text-text-primary">{rfq._count?.quotations ?? 0}</strong></span>
              </div>

              <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-brand-primary transition hidden md:block" />
            </div>
          </div>
        ))}

        {filteredRfqs.length === 0 && (
          <div className="bg-white border border-border-default border-dashed rounded p-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-text-secondary/40 mx-auto" />
            <h3 className="text-text-primary font-bold text-sm">No RFQs Found</h3>
            <p className="text-text-secondary text-xs max-w-sm mx-auto">
              There are no Request for Quotations matching the filters or search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
