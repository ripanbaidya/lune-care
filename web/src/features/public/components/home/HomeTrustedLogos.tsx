import React from "react";

const BRANDS = [
  "Apollo Clinics",
  "MediPrime",
  "CloudCare",
  "Nova Health",
  "Pulse Network",
  "CareAxis",
  "Arogya Labs",
  "MediSphere",
];

const HomeTrustedLogos: React.FC = () => {
  return (
    <section className="relative border-y border-white/10 bg-gradient-to-b from-gray-950/70 to-black/70 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(37,99,235,0.15),transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-[0.22em] text-gray-500 font-semibold mb-6">
          Trusted by teams scaling modern healthcare operations
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-black to-transparent z-10" />
          <div className="flex gap-4 min-w-max animate-[marquee_26s_linear_infinite]">
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <div
                key={`${brand}-${index}`}
                className="home-premium-card home-admin-hover rounded-xl px-6 py-3 text-sm text-gray-300 shadow-[0_8px_30px_rgba(0,0,0,0.22)]"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default HomeTrustedLogos;
