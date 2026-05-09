import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const FAQ_ITEMS = [
  {
    q: "How does LuneCare verify doctors?",
    a: "We validate professional credentials and profile data before enabling doctor visibility in discovery.",
  },
  {
    q: "Can patients reschedule or cancel appointments?",
    a: "Yes. Patients can manage upcoming bookings with transparent status updates and real-time notifications.",
  },
  {
    q: "Is LuneCare suitable for multi-clinic operations?",
    a: "Absolutely. LuneCare supports multiple clinics, schedules, consultation fees, and role-based workflows.",
  },
  {
    q: "Do you provide analytics for growth and retention?",
    a: "Yes. Teams get insights across booking funnel, appointment completion, utilization, and patient engagement.",
  },
];

const HomeFaq: React.FC = () => {
  const [active, setActive] = useState<number>(0);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
      <HomeSectionHeader
        badge="FAQ"
        title="Answers to common questions"
        subtitle="Everything you need to know before choosing LuneCare for your care operations."
        centered
      />

      <div className="mt-10 space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = active === index;
          return (
            <div
              key={item.q}
              className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <button
                onClick={() => setActive(isOpen ? -1 : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between"
              >
                <span className="text-white font-medium">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen ? (
                <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HomeFaq;
