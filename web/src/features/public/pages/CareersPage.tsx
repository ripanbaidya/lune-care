import React from "react";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeFooter from "../components/home/HomeFooter";

const CareersPage: React.FC = () => {
  return (
    <div className="home-premium min-h-screen bg-black text-white">
      <HomeNavbar />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 min-h-[320px]">
          <h1 className="text-3xl sm:text-4xl font-bold">Careers</h1>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default CareersPage;
