import React from 'react';
import {Clock, LogOut, Stethoscope} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '../../../store/authStore';
import {authService} from '../../auth/authService.ts';
import {ROUTES} from '../../../routes/routePaths';
import {useAccountStatusPoller} from '../../../shared/hooks/useAccountStatus';
import Spinner from "../../../shared/components/ui/Spinner.tsx";

const DoctorPendingVerificationPage: React.FC = () => {
    const {clearAuth, refreshToken} = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (refreshToken) await authService.logout({refreshToken});
        } catch {
            // best-effort
        } finally {
            clearAuth();
            navigate(ROUTES.login, {replace: true});
        }
    };

    useAccountStatusPoller();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                    <Stethoscope size={18} className="text-white"/>
                </div>
                <div>
                    <span className="text-xl font-bold text-gray-900">LuneCare</span>
                    <p className="text-xs text-teal-600 font-medium leading-none">Doctor Portal</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={28} className="text-amber-600"/>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Pending</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Your account is currently under review by our admin team. You'll be notified
                    via the platform once your verification is complete.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-left mb-4">
                    <p className="text-xs font-medium text-amber-800 mb-2">What to expect</p>
                    <ul className="text-xs text-amber-700 space-y-1.5">
                        <li>• Admin reviews your submitted credentials and documents</li>
                        <li>• Typical review time is 24–48 hours</li>
                        <li>• You'll receive a notification once approved or if action is needed</li>
                        <li>• Once approved, you can access all doctor features</li>
                    </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                    <Spinner size="sm"/>
                    <span>Checking approval status automatically...</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={14}/>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DoctorPendingVerificationPage;