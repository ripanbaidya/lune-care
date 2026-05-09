import React from "react";
import {
  Activity,
  BellRing,
  CalendarClock,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const FEATURE_CARDS = [
  {
    title: "Smart Appointment Engine",
    description:
      "Balance doctor schedules, reduce wait-time, and auto-match slots with patient preferences.",
    icon: CalendarClock,
    className: "sm:col-span-2",
  },
  {
    title: "Real-Time Notifications",
    description:
      "Instant updates for booking confirmations, delays, reminders, and follow-ups.",
    icon: BellRing,
    className: "",
  },
  {
    title: "Secure Clinical Profiles",
    description:
      "Maintain verified doctor credentials, specialties, and public trust signals in one place.",
    icon: ShieldCheck,
    className: "",
  },
  {
    title: "Unified Patient Journey",
    description:
      "From discovery to payment to feedback, every step feels seamless and intuitive.",
    icon: Workflow,
    className: "sm:col-span-2",
  },
  {
    title: "Revenue Intelligence",
    description:
      "Track consultation fees, payments, and growth opportunities with actionable data.",
    icon: CircleDollarSign,
    className: "",
  },
  {
    title: "AI-Powered Triage",
    description:
      "Prioritize urgent cases and route requests intelligently for faster clinical response.",
    icon: Sparkles,
    className: "",
  },
];

const HomeFeatureBento: React.FC = () => {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.13),transparent_35%)]" />
      <HomeSectionHeader
        badge="Core Features"
        title="Built for speed, trust, and medical-grade reliability"
        subtitle="Every workflow is crafted to help patients book confidently and providers operate with precision."
        centered
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/15 to-indigo-600/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-300 font-semibold">
              Platform Snapshot
            </p>
            <p className="mt-2 text-white text-lg font-semibold">
              94% faster appointment turnaround for returning patients
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              99.9% uptime
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-400" />
              5k+ doctors
            </div>
          </div>
        </div>

        {FEATURE_CARDS.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className={`group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/[0.07] hover:-translate-y-0.5 ${feature.className}`}
            >
              <div className="w-11 h-11 rounded-xl border border-blue-400/30 bg-blue-500/10 flex items-center justify-center mb-5">
                <Icon size={20} className="text-blue-300" />
              </div>
              <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default HomeFeatureBento;
