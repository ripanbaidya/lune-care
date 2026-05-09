import React from "react";
import { Receipt, CheckCircle2, IndianRupee } from "lucide-react";
import type { PaymentResponse } from "../types/payment.types";

interface StatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const Stat: React.FC<StatProps> = ({ label, value, icon, color }) => (
  <div className={`rounded-xl border px-4 py-3 bg-gray-900/50 ${color}`}>
    <div className="flex items-center gap-1.5 mb-1">{icon}</div>
    <p className="text-lg font-bold text-gray-100">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

interface PaymentStatsProps {
  payments: PaymentResponse[];
  totalElements: number;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({
  payments,
  totalElements,
}) => {
  const completed = payments.filter((p) => p.status === "SUCCESS");
  const totalSpentRupees = completed.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat
        label="Total"
        value={String(totalElements)}
        icon={<Receipt size={13} className="text-gray-400" />}
        color="border-gray-700/50"
      />
      <Stat
        label="Successful"
        value={String(completed.length)}
        icon={<CheckCircle2 size={13} className="text-green-400" />}
        color="border-green-700/40"
      />
      <Stat
        label="Spent (page)"
        value={`₹${totalSpentRupees.toLocaleString("en-IN")}`}
        icon={<IndianRupee size={13} className="text-blue-400" />}
        color="border-blue-700/40"
      />
    </div>
  );
};
