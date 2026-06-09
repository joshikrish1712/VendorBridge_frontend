import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Calendar, DollarSign, ChevronRight, Inbox } from "lucide-react";

interface Quotation {
  id: string;
  price: string;
  deliveryTimeline: number;
  remarks: string | null;
  createdAt: string;
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    status: string;
  };
}

export const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await api.get("/quotations/vendor/my");
        setQuotations(res.data.data);
      } catch (err) {
        console.error("Error fetching vendor quotations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border-default pb-4">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Submitted Bidding Proposals</h1>
        <p className="text-text-secondary text-xs mt-0.5">Track and review submitted quotations, shipping conditions, and pricing.</p>
      </div>

      <div className="grid gap-3">
        {quotations.map((quote) => (
          <div
            key={quote.id}
            onClick={() => navigate(`/rfqs/${quote.rfq.id}`)}
            className="bg-white border border-border-default rounded p-4 hover:border-brand-primary/40 hover:bg-slate-50/50 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider">{quote.rfq.rfqNumber}</span>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  Status: {quote.rfq.status.replace(/_/g, " ")}
                </span>
              </div>
              <h2 className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition truncate">
                {quote.rfq.title}
              </h2>
              {quote.remarks && <p className="text-text-secondary text-xs line-clamp-1">Remarks: "{quote.remarks}"</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary shrink-0 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                <span>Date: <strong className="text-text-primary">{new Date(quote.createdAt).toLocaleDateString()}</strong></span>
              </div>

              <div>
                <span>Timeline: <strong className="text-text-primary">{quote.deliveryTimeline} Days</strong></span>
              </div>

              <div className="flex items-center gap-0.5">
                <DollarSign className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-xs font-bold text-brand-primary">${Number(quote.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <ChevronRight className="w-4 h-4 text-text-secondary/60 group-hover:text-brand-primary transition hidden md:block" />
            </div>
          </div>
        ))}

        {quotations.length === 0 && (
          <div className="bg-white border border-border-default border-dashed rounded p-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-text-secondary/40 mx-auto" />
            <h3 className="text-text-primary font-bold text-sm">No Proposals Found</h3>
            <p className="text-text-secondary text-xs max-w-sm mx-auto">
              You haven't submitted any quotations to active RFQs yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
