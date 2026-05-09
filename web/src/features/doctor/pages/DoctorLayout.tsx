import {Outlet} from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';

const DoctorLayout: React.FC = () => (
    <div className="flex min-h-screen bg-black">
        <DoctorSidebar/>
        <main className="flex-1 md:ml-60 pt-14 md:pt-0 overflow-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Outlet/>
            </div>
        </main>
    </div>
);

export default DoctorLayout;