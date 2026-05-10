import React from "react";
import { ExternalLink, Globe, Briefcase, UserCircle2 } from "lucide-react";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeFooter from "../components/home/HomeFooter";
import PublicContactSection from "../components/common/PublicContactSection";

const DeveloperPage: React.FC = () => {
  return (
    <div className="home-premium min-h-screen bg-black text-white">
      <HomeNavbar />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/70 to-black/70 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300 font-semibold">
            Developer Profile
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold">Ripan Baidya</h1>
          <div className="mt-6 grid items-start lg:grid-cols-[320px_1fr] gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white mb-3">
                Profile Photo
              </p>
              <div className="h-66 rounded-xl border border-gray-700/70 bg-black/40 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/ripan-baidya.png"
                  alt="Ripan Baidya"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="self-start rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-gray-300 max-w-3xl">
                Full-stack developer focused on building reliable,
                user-friendly, and business-ready digital products.
              </p>
              <h2 className="mt-6 text-xl font-semibold text-white">
                Important Links
              </h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-gray-200 hover:bg-white/[0.06] transition-colors"
                >
                  <Globe size={16} className="text-blue-300" /> Website{" "}
                  <ExternalLink size={14} className="ml-auto text-gray-500" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ripanbaidya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-gray-200 hover:bg-white/[0.06] transition-colors"
                >
                  <Briefcase size={16} className="text-blue-300" /> LinkedIn{" "}
                  <ExternalLink size={14} className="ml-auto text-gray-500" />
                </a>
                <a
                  href="https://github.com/ripanbaidya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-gray-200 hover:bg-white/[0.06] transition-colors"
                >
                  <UserCircle2 size={16} className="text-blue-300" /> GitHub{" "}
                  <ExternalLink size={14} className="ml-auto text-gray-500" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <PublicContactSection
          title="Message Ripan Baidya"
          subtitle="Clients can directly contact on WhatsApp or send an email with name, email, and message."
          emailTo="official.ripanbaidya@gmail.com"
          whatsappNumber="+917980717584"
        />
      </main>
      <HomeFooter />
    </div>
  );
};

export default DeveloperPage;
