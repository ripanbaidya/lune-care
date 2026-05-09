import React from "react";
import { ShieldCheck } from "lucide-react";
import { useOverview } from "../hooks/useAdmin";
import OverviewCards from "../components/OverviewCards";
import PendingDoctorTable from "../components/PendingDoctorTable";

const AdminDashboard: React.FC = () => {
  const { data: overviewRes, isLoading: overviewLoading } = useOverview();
  const overview = overviewRes?.data;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <ShieldCheck size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Platform overview and verification management
          </p>
        </div>
      </div>

      {/* Overview stats */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-gray-800/60 bg-gray-900/40 animate-pulse"
            />
          ))}
        </div>
      ) : overview ? (
        <OverviewCards data={overview} />
      ) : null}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      {/* Pending verification table */}
      <section>
        <PendingDoctorTable />
      </section>
    </div>
  );
};

export default AdminDashboard;
