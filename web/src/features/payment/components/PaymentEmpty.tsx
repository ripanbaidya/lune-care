import React from "react";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { ROUTES } from "../../../routes/routePaths";

export const PaymentEmpty: React.FC = () => (
  <div className="bg-gradient-to-b from-gray-900/50 to-gray-950/50 rounded-xl border border-gray-700/50 flex flex-col items-center py-16 gap-3">
    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
      <Receipt size={24} className="text-gray-600" />
    </div>
    <p className="text-sm font-medium text-gray-200">No payment records yet</p>
    <p className="text-xs text-gray-400 text-center max-w-xs">
      Payments for your appointments will appear here once you complete a
      booking.
    </p>
    <Link
      to={ROUTES.findDoctors}
      className="mt-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25"
    >
      Find a Doctor
    </Link>
  </div>
);
