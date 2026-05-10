import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useDoctorSearch } from "../hooks/useDoctorSearch";
import { type Specialization } from "../../doctor/types/doctor.types";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeHero from "../components/home/HomeHero";
import HomeTrustedLogos from "../components/home/HomeTrustedLogos";
import HomeFeatureBento from "../components/home/HomeFeatureBento";
import HomeProductShowcase from "../components/home/HomeProductShowcase";
import HomeBenefits from "../components/home/HomeBenefits";
import HomeTestimonials from "../components/home/HomeTestimonials";
import HomeAiShowcase from "../components/home/HomeAiShowcase";
import HomeSpecializations from "../components/home/HomeSpecializations";
import HomeDoctorList from "../components/home/HomeDoctorList";
import HomePremiumCta from "../components/home/HomePremiumCta";
import HomeFaq from "../components/home/HomeFaq";
import HomeFooter from "../components/home/HomeFooter";

const FEATURED_SPECIALIZATIONS: Specialization[] = [
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "PEDIATRICIAN",
  "GYNECOLOGIST",
  "GENERAL_PHYSICIAN",
];

const HomePage: React.FC = () => {
  const [searchName, setSearchName] = useState("");
  const [activeSpec, setActiveSpec] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading } = useDoctorSearch({
    name: searchName || undefined,
    specialization: activeSpec || undefined,
    size: 6,
  });

  const doctors = data?.data?.content ?? [];

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="home-premium min-h-screen bg-black text-white scroll-smooth">
      <HomeNavbar />

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        <HomeHero searchName={searchName} onSearchChange={setSearchName} />
        <HomeTrustedLogos />
        <HomeFeatureBento />
        <HomeProductShowcase />
        <HomeSpecializations
          specializations={FEATURED_SPECIALIZATIONS}
          activeSpec={activeSpec}
          onSpecSelect={setActiveSpec}
        />
        <HomeDoctorList doctors={doctors} isLoading={isLoading} />
        <HomeBenefits />
        <HomeTestimonials />
        <HomeAiShowcase />
        <HomeFaq />
        <HomePremiumCta />
        <HomeFooter />
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full border border-blue-400/30 bg-blue-600/90 text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
        >
          <ChevronUp size={20} className="mx-auto" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
