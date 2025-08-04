
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { ICONS } from './constants';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex items-center space-x-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
            {icon}
        </div>
        <p className="flex-grow font-medium text-gray-800">{label}</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
);

const OtherSettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout title="Impostazioni" showBack>
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-gray-800 px-1 mb-2">Impostazioni</h3>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                         <SettingRow icon={ICONS.bell_outline} label="Notifiche" onClick={() => navigate('/settings/notifications')} />
                         <div className="border-t border-gray-100 mx-4"></div>
                         <SettingRow icon={ICONS.language} label="Lingua" onClick={() => navigate('/settings/language')} />
                         <div className="border-t border-gray-100 mx-4"></div>
                         <SettingRow icon={ICONS.theme} label="Tema" onClick={() => navigate('/settings/theme')} />
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-gray-800 px-1 mb-2">Informazioni</h3>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                         <SettingRow icon={ICONS.help} label="Aiuto" onClick={() => navigate('/settings/help')} />
                         <div className="border-t border-gray-100 mx-4"></div>
                         <SettingRow icon={ICONS.feedback} label="Feedback" onClick={() => navigate('/settings/feedback')} />
                         <div className="border-t border-gray-100 mx-4"></div>
                         <SettingRow icon={ICONS.info} label="Informazioni sull'app" onClick={() => navigate('/settings/about')} />
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default OtherSettingsPage;
