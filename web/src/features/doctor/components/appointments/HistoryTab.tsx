import React, { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Spinner from "../../../../shared/components/ui/Spinner";
import { AppError } from "../../../../shared/utils/errorParser";
import {
  useCancelAppointment,
  useDoctorAppointmentHistory,
  useMarkAppointmentComplete,
  useMarkNoShow,
} from "../../hooks/useDoctorAppointments";
import TodayCard from "./TodayCard";

type HistoryFilter = "all" | "completed" | "cancelled" | "no_show";

const STATUS_FILTER_MAP: Record<HistoryFilter, string[]> = {
  all: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "PENDING_PAYMENT"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED"],
  no_show: ["NO_SHOW"],
};

const HISTORY_TABS: { key: HistoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no_show", label: "No Show" },
];

const HistoryTab: React.FC = () => {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useDoctorAppointmentHistory(page, PAGE_SIZE);
  const { mutate: markComplete, isPending: isCompleting } =
    useMarkAppointmentComplete();
  const { mutate: markNoShow, isPending: isNoShow } = useMarkNoShow();
  const { mutate: cancelAppt, isPending: isCancelling } =
    useCancelAppointment();
  const [actingId, setActingId] = useState<string | null>(null);

  const all = data?.data?.content ?? [];
  const isPending = isCompleting || isNoShow || isCancelling;

  const handleComplete = (id: string) => {
    setActingId(id);
    markComplete(id, {
      onSuccess: () => {
        toast.success("Marked as completed");
        setActingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingId(null);
      },
    });
  };

  const handleNoShow = (id: string) => {
    if (!window.confirm("Mark as no-show?")) return;
    setActingId(id);
    markNoShow(id, {
      onSuccess: () => {
        toast.success("Marked as no-show");
        setActingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingId(null);
      },
    });
  };

  const handleCancel = (id: string, reason: string) => {
    setActingId(id);
    cancelAppt(
      { appointmentId: id, reason },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled");
          setActingId(null);
        },
        onError: (err: AppError) => {
          toast.error(err.message);
          setActingId(null);
        },
      },
    );
  };

  const pageInfo = data?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const filtered = all.filter((a) =>
    STATUS_FILTER_MAP[filter].includes(a.status),
  );

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex border border-white/10 rounded-lg overflow-hidden w-fit">
        {HISTORY_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setFilter(t.key);
              setPage(0);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === t.key
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center py-14 gap-3">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <CalendarDays size={24} className="text-gray-600" />
          </div>
          <p className="text-sm text-gray-500">
            No {filter === "all" ? "" : filter.replace("_", "-")} appointments
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <TodayCard
              key={appt.id}
              appt={appt}
              onComplete={handleComplete}
              onNoShow={handleNoShow}
              onCancel={handleCancel}
              actingId={isPending ? actingId : null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 border border-white/10 text-gray-400 text-sm rounded-lg hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-white/10 text-gray-400 text-sm rounded-lg hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
