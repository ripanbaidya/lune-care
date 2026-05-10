import React from "react";
import { BarChart3, Clock3, HandHeart, Shield } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const STEPS = [
  {
    title: "Discover",
    description: "Patients find trusted specialists with verified profiles and clear availability.",
  },
  {
    title: "Book",
    description: "Instant slot selection and confirmation reduce admin overhead and no-shows.",
  },
  {
    title: "Engage",
    description: "Automated reminders, notifications, and follow-ups improve completion rates.",
  },
  {
    title: "Grow",
    description: "Analytics-driven insights unlock operational improvements and revenue growth.",
  },
];

const HomeBenefits: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <HomeSectionHeader
          badge="Why LuneCare"
          title="Deliver better care outcomes with less operational friction"
          subtitle="Engineered for healthcare teams who need speed, precision, and trust at every interaction."
        />

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Clock3, metric: "38%", label: "faster booking flow" },
            { icon: BarChart3, metric: "3.4x", label: "higher slot utilization" },
            { icon: HandHeart, metric: "91%", label: "patient satisfaction score" },
            { icon: Shield, metric: "99.9%", label: "platform reliability" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="home-premium-card home-admin-hover p-5"
              >
                <Icon size={18} className="text-blue-300 mb-3" />
                <p className="text-2xl font-bold text-white">{item.metric}</p>
                <p className="mt-1 text-sm text-gray-400">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-premium-card home-admin-hover mt-12 bg-gradient-to-b from-gray-900/70 to-black/70 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-blue-300 font-semibold mb-6">
          Care Journey
        </p>
        <div className="grid sm:grid-cols-4 gap-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="home-premium-card home-admin-hover rounded-xl p-4 h-full">
                <div className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold flex items-center justify-center mb-3">
                  {index + 1}
                </div>
                <h3 className="text-white font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeBenefits;
