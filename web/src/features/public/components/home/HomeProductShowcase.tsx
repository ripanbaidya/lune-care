import React from "react";
import { CheckCircle2, MonitorPlay, Smartphone, TabletSmartphone } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const HomeProductShowcase: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(29,78,216,0.16),transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
        <HomeSectionHeader
          badge="Product Experience"
          title="A modern care platform your team actually wants to use"
          subtitle="LuneCare brings scheduling, communication, and engagement into one premium workflow built for clarity."
        />

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/90 to-black/85 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MonitorPlay size={16} className="text-blue-400" />
                  Live Operations Board
                </div>
                <span className="text-xs text-blue-300">Real-time</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                alt="Healthcare operations dashboard"
                className="w-full h-56 object-cover rounded-xl border border-white/10"
              />

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Unified booking timeline",
                  "Smart cancellation handling",
                  "Patient retention insights",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300"
                  >
                    <CheckCircle2 size={12} className="inline mr-1 text-blue-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-2">
                <Smartphone size={14} className="text-blue-300" />
                Mobile-ready
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-2">
                <TabletSmartphone size={14} className="text-blue-300" />
                Tablet workflows
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-2">
                <MonitorPlay size={14} className="text-blue-300" />
                Web portal
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeProductShowcase;
