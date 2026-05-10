import React from "react";
import { Star } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";

const TESTIMONIALS = [
  {
    name: "Dr. A. Mukherjee",
    role: "Cardiologist",
    quote:
      "LuneCare helped us streamline appointment flow without sacrificing patient experience. It feels thoughtfully built for real clinics.",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Priya Sharma",
    role: "Patient",
    quote:
      "The interface is fast, clear, and trustworthy. Booking follow-ups and finding the right doctor now takes minutes, not hours.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Ritika Sen",
    role: "Clinic Operations Lead",
    quote:
      "From reminders to payment visibility, we finally have one system where doctors and patients stay perfectly aligned.",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80",
  },
];

const HomeTestimonials: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(59,130,246,0.12),transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <HomeSectionHeader
          badge="Testimonials"
          title="Loved by doctors, patients, and operations teams"
          subtitle="Real feedback from teams that use LuneCare to deliver premium healthcare experiences."
          centered
        />

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.name}
              className="home-premium-card home-admin-hover rounded-2xl bg-gradient-to-b from-gray-900/60 to-black/60 p-6 hover:border-blue-500/40"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-12 w-12 rounded-full object-cover border border-white/20"
                />
                <div>
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                “{item.quote}”
              </p>
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} className="text-blue-400" fill="currentColor" />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
