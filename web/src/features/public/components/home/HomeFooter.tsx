import React from "react";
import { Globe, MessageCircle, Send, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../routes/routePaths";

const HomeFooter: React.FC = () => {
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
              {[Globe, MessageCircle, Send].map((Icon, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-blue-500/10 hover:border-blue-500/40 text-gray-400 hover:text-blue-300 transition-all flex items-center justify-center"
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to={ROUTES.findDoctors} className="hover:text-blue-400 transition-colors">
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
                <a href="#" className="hover:text-blue-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
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
