import React from "react";

const InfoRow: React.FC<{
  label: string;
  value: string | null | undefined;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm text-gray-100 font-medium">{value || "—"}</span>
  </div>
);

export default InfoRow;
