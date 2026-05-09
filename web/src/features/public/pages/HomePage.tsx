import React, { useState } from "react";
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

  const { data, isLoading } = useDoctorSearch({
    name: searchName || undefined,
    specialization: activeSpec || undefined,
    size: 6,
  });

  const doctors = data?.data?.content ?? [];

  return (
    <div className="min-h-screen bg-black text-white scroll-smooth">
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
    </div>
  );
};

export default HomePage;
