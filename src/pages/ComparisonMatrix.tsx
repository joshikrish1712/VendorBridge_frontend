import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, Award, CheckCircle2, ShieldAlert, Star, Zap } from "lucide-react";

interface CompareDetails {
  rfq: {
    id: string;
    rfqNumber: string;
    title: string;
    description: string;
    deadline: string;
    status: string;
  };
  quotations: {
    id: string;
    price: string;
    deliveryTimeline: number;
    remarks: string | null;
    createdAt: string;
    vendor: {
      name: string;
      rating: number;
      email: string;
    };
    items: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }[];
  }[];
  lowestPriceQuotationId: string | null;
  fastestDeliveryQuotationId: string | null;
  highestRatedVendorQuotationId: string | null;
}

export const ComparisonMatrix: React.FC = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<CompareDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState("Net 30 days. Delivery to be completed as per quotation timeline.");
  const [awardingId, setAwardingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompareData = async () => {
      try {
        const res = await api.get(`/quotations/rfq/${rfqId}/compare`);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError("Failed to load quotation comparison data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompareData();
  }, [rfqId]);

  const handleAwardContract = async (quotationId: string) => {
    setError("");
    setAwardingId(quotationId);
    try {
      const res = await api.post("/purchase-orders", {
        quotationId,
        termsAndConditions: terms,
      });
      const po = res.data.data;
      navigate(`/purchase-orders/${po.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate Purchase Order.");
      setAwardingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.quotations.length === 0) {
    return (
      <div className="space-y-4 text-center py-12 max-w-lg mx-auto">
        <ShieldAlert className="w-10 h-10 text-text-secondary/50 mx-auto" />
        <h2 className="text-text-primary font-bold text-sm uppercase tracking-wider">No Quotations Found</h2>
        <p className="text-text-secondary text-xs">There are no supplier bids submitted for this RFQ yet. Comparison is not available.</p>
        <Link to={`/rfqs/${rfqId}`} className="text-brand-primary hover:underline text-xs font-semibold block">
          Back to RFQ Details
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border-default pb-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate(`/rfqs/${rfqId}`)}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition text-xs font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RFQ Details</span>
          </button>
          <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Bids Comparison Matrix</h1>
          <p className="text-text-secondary text-xs">
            Comparing quotations for <span className="text-brand-primary font-bold">{data.rfq.rfqNumber} - {data.rfq.title}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs p-3.5 rounded flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Global Terms Block */}
      <div className="bg-white border border-border-default p-5 rounded shadow-sm space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Default Purchase Order Terms</label>
        <input
          type="text"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="e.g. Net 30 payment, free delivery"
          className="w-full bg-white border border-border-default rounded py-2 px-3 text-text-primary text-xs focus:outline-none focus:border-brand-primary transition"
        />
        <span className="text-[10px] text-text-secondary block">These terms will be stamped onto the generated Purchase Order contract.</span>
      </div>

      {/* Quotations Compare Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.quotations.map((quote) => {
          const isLowestPrice = quote.id === data.lowestPriceQuotationId;
          const isFastestTimeline = quote.id === data.fastestDeliveryQuotationId;
          const isHighestRating = quote.id === data.highestRatedVendorQuotationId;

          return (
            <div
              key={quote.id}
              className={`
                bg-white border rounded p-5 space-y-5 flex flex-col justify-between hover:border-brand-primary/40 transition relative overflow-hidden shadow-sm
                ${isLowestPrice ? "border-emerald-500 ring-1 ring-emerald-500/25 bg-emerald-50/5" : "border-border-default"}
              `}
            >
              {/* Highlight Badges */}
              <div className="flex flex-wrap gap-1 absolute top-4 right-4">
                {isLowestPrice && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Award className="w-3 h-3" />
                    <span>Best Price</span>
                  </span>
                )}
                {isFastestTimeline && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-brand-warning border border-amber-200">
                    <Zap className="w-3 h-3" />
                    <span>Fastest</span>
                  </span>
                )}
                {isHighestRating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-brand-primary border border-brand-primary/10">
                    <Star className="w-3 h-3 fill-brand-primary/10" />
                    <span>Top Rated</span>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1 pr-20">
                  <h3 className="font-bold text-text-primary text-sm truncate">{quote.vendor.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-brand-warning font-semibold">
                    <span>★ {Number(quote.vendor.rating).toFixed(1)} Rating</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-text-secondary block uppercase font-bold tracking-wider">Total Bid</span>
                    <strong className="text-text-primary text-base font-bold">${Number(quote.price).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-secondary block uppercase font-bold tracking-wider">Timeline</span>
                    <strong className="text-text-primary text-base font-bold">{quote.deliveryTimeline} Days</strong>
                  </div>
                </div>

                {/* Scope items */}
                <div className="space-y-2">
                  <span className="text-[10px] text-text-secondary block uppercase font-bold tracking-wider">Line Items Detail</span>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {quote.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[10px] text-text-secondary bg-slate-50 p-2 rounded border border-slate-100">
                        <span>{item.description} (x{item.quantity})</span>
                        <strong className="text-text-primary">${Number(item.totalPrice).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {quote.remarks && (
                  <div className="text-[10px] text-text-secondary bg-slate-50 p-2 rounded border border-border-default italic">
                    "{quote.remarks}"
                  </div>
                )}
              </div>

              {/* Award Action */}
              <div className="pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => handleAwardContract(quote.id)}
                  disabled={awardingId !== null}
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-2 rounded transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {awardingId === quote.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Select &amp; Generate PO Contract</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
