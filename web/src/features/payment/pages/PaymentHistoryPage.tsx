import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePaymentHistory } from "../hooks/usePayment";
import Spinner from "../../../shared/components/ui/Spinner";
import { PaymentCard } from "../components/PaymentCard";
import { PaymentStats } from "../components/PaymentStats";
import { PaymentEmpty } from "../components/PaymentEmpty";

const PaymentHistoryPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const { data, isLoading } = usePaymentHistory(page, PAGE_SIZE);
  const payments = data?.data?.content ?? [];
  const pageInfo = data?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Payment History</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          All payment transactions for your appointments
        </p>
      </div>

      {/* Summary stats (only when data is loaded) */}
      {!isLoading && payments.length > 0 && (
        <PaymentStats payments={payments} totalElements={totalElements} />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : payments.length === 0 ? (
        <PaymentEmpty />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <PaymentCard key={p.id} payment={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
          <p className="text-xs text-gray-400">
            Page {page + 1} of {totalPages} · {totalElements} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
