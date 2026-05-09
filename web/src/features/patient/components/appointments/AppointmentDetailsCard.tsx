import React from "react";
import { Calendar, Clock, IndianRupee, Receipt } from "lucide-react";

interface AppointmentDetailsProps {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationFees?: number | null;
  paymentId?: string | null;
}

const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const formatDate = (d: string) => {
  if (!d) return "Date is not provided";
  const date = new Date(d);
  if (isNaN(date.getTime())) {
    console.log("Invalid date string received!", d);
    return "Invalid date format";
  }
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}> = ({ icon, iconBg, label, value }) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-md`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400/80 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-100 mt-0.5">{value}</p>
    </div>
  </div>
);

const AppointmentDetailsCard: React.FC<AppointmentDetailsProps> = ({
  appointmentDate,
  startTime,
  endTime,
  consultationFees,
  paymentId,
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 rounded-2xl border border-white/10 px-6 py-6 shadow-md hover:border-white/20 transition-all duration-300 backdrop-blur-xl">
      <p className="text-xs font-bold text-gray-400/70 uppercase tracking-widest mb-5">
        Appointment Details
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DetailItem
          icon={<Calendar size={16} className="text-blue-400/90" />}
          iconBg="bg-blue-600/20"
          label="Date"
          value={formatDate(appointmentDate)}
        />

        <DetailItem
          icon={<Clock size={16} className="text-blue-400/90" />}
          iconBg="bg-blue-600/20"
          label="Time"
          value={`${formatTime(startTime)} – ${formatTime(endTime)}`}
        />

        <DetailItem
          icon={<IndianRupee size={16} className="text-emerald-400/90" />}
          iconBg="bg-emerald-600/20"
          label="Consultation Fee"
          value={`₹${consultationFees ?? "—"}`}
        />

        {paymentId && (
          <DetailItem
            icon={<Receipt size={16} className="text-green-400/90" />}
            iconBg="bg-green-600/20"
            label="Payment ID"
            value={
              paymentId.length > 16 ? `${paymentId.slice(0, 16)}...` : paymentId
            }
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailsCard;
