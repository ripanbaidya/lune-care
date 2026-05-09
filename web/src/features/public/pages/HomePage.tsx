import React, { useState } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useDoctorSearch } from "../../doctor/hooks/useDoctorSearch";
import { type Specialization } from "../../doctor/types/doctor.types";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeHero from "../components/home/HomeHero";
import HomeSpecializations from "../components/home/HomeSpecializations";
import HomeDoctorList from "../components/home/HomeDoctorList";
import HomeCta from "../components/home/HomeCta";
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
  const { isAuthenticated } = useAuth();
  const [searchName, setSearchName] = useState("");
  const [activeSpec, setActiveSpec] = useState<string>("");

  const { data, isLoading } = useDoctorSearch({
    name: searchName || undefined,
    specialization: activeSpec || undefined,
    size: 6,
  });

  const doctors = data?.data?.content ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <HomeNavbar />

      {/* Add padding to account for fixed navbar */}
      <div className="pt-16">
        <HomeHero searchName={searchName} onSearchChange={setSearchName} />
        <HomeSpecializations
          specializations={FEATURED_SPECIALIZATIONS}
          activeSpec={activeSpec}
          onSpecSelect={setActiveSpec}
        />
        <HomeDoctorList doctors={doctors} isLoading={isLoading} />
        <HomeCta isAuthenticated={isAuthenticated} />
        <HomeFooter />
      </div>
    </div>
  );
};

export default HomePage;
