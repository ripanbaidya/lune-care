import React from "react";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeFooter from "../components/home/HomeFooter";
import PublicContactSection from "../components/common/PublicContactSection";

const ContactPage: React.FC = () => {
  return (
    <div className="home-premium min-h-screen bg-black text-white">
      <HomeNavbar />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <PublicContactSection
          title="Contact Us"
          subtitle="Use this form to share your requirement. You can contact via WhatsApp or Email."
          emailTo="official.ripanbaidya@gmail.com"
          whatsappNumber="+917980717584"
        />
      </main>
      <HomeFooter />
    </div>
  );
};

export default ContactPage;
