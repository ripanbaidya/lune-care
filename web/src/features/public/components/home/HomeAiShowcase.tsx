import React from "react";
import { BrainCircuit, LineChart, Radar, Sparkles, Zap } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const HomeAiShowcase: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="home-premium-card home-admin-hover rounded-3xl bg-gradient-to-br from-blue-950/35 via-gray-950/80 to-black/90 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute -top-28 -right-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-10">
          <HomeSectionHeader
            badge="AI + Analytics"
            title="Predict demand, automate workflows, and optimize every care touchpoint"
            subtitle="LuneCare intelligence layer highlights booking patterns, churn risk, and follow-up opportunities in real time."
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="home-premium-card home-admin-hover col-span-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Forecasted Load</p>
                <LineChart size={16} className="text-blue-300" />
              </div>
              <div className="mt-4 flex items-end gap-2 h-24">
                {[32, 40, 58, 62, 54, 70, 78, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/60 to-blue-300/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="home-premium-card home-admin-hover p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">Automation Rate</p>
                <Zap size={15} className="text-blue-300" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">72%</p>
              <p className="text-xs text-gray-500 mt-1">+18% this quarter</p>
            </div>
            <div className="home-premium-card home-admin-hover p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">Triage Confidence</p>
                <BrainCircuit size={15} className="text-blue-300" />
              </div>
              <p className="mt-2 text-2xl font-bold text-white">96.4%</p>
              <p className="text-xs text-gray-500 mt-1">Across active clinics</p>
            </div>
            <div className="home-premium-card home-admin-hover col-span-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">Operational Radar</p>
                <Radar size={16} className="text-blue-300" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  "Follow-up adherence",
                  "Peak-hour balancing",
                  "Wait-time reduction",
                  "Doctor utilization",
                  "Payment completion",
                  "Patient response",
                ].map((k) => (
                  <div key={k} className="home-premium-card home-admin-hover rounded-lg px-3 py-2 text-gray-300">
                    <Sparkles size={11} className="inline mr-1 text-blue-300" />
                    {k}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAiShowcase;
