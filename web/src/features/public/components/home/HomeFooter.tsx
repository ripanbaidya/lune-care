import React from "react";
import { Stethoscope } from "lucide-react";
import { FaFacebookF, FaGithub, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../routes/routePaths";

const HomeFooter: React.FC = () => {
  const socialLinks = [
    {
      icon: FaFacebookF,
      href: "https://facebook.com",
      label: "Facebook",
      hoverClass:
        "hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-400",
    },
    {
      icon: FaInstagram,
      href: "https://instagram.com",
      label: "Instagram",
      hoverClass:
        "hover:bg-pink-500/10 hover:border-pink-500/40 hover:text-pink-400",
    },
    {
      icon: FaGithub,
      href: "https://github.com/ripanbaidya",
      label: "GitHub",
      hoverClass:
        "hover:bg-gray-200/10 hover:border-gray-300/40 hover:text-gray-100",
    },
  ];

  return (
    <footer className="border-t border-gray-800/50 bg-gradient-to-b from-gray-950/80 to-black py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Stethoscope size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">LuneCare</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium healthcare operations platform for modern clinics and
              patient-first teams.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {socialLinks.map(({ icon: Icon, href, label, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] text-gray-400 transition-all flex items-center justify-center ${hoverClass}`}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to={ROUTES.findDoctors}
                  className="hover:text-blue-400 transition-colors"
                >
                  Find Doctors
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  For Doctors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to={ROUTES.about}
                  className="hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.contact}
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.careers}
                  className="hover:text-blue-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.developer}
                  className="hover:text-blue-400 transition-colors"
                >
                  Developer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  to={ROUTES.privacyPolicy}
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.termsOfService}
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 LuneCare. Crafted for exceptional care delivery.</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
