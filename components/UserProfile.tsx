
import React from 'react';
import { useData } from '../context/DataContext';
import { ToolStatus } from '../types';
import { ClipboardDocumentListIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from './common/Icon';
import { STATUS_STYLES } from '../constants';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div className="bg-brand-surface p-4 rounded-lg shadow-sm flex items-center space-x-4">
    <div className="bg-blue-100 p-3 rounded-full">
      <Icon className="w-6 h-6 text-brand-primary" />
    </div>
    <div>
      <p className="text-sm font-medium text-brand-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-brand-text-primary">{value}</p>
    </div>
  </div>
);

export const UserProfile: React.FC = () => {
  const { authenticatedUser, loanRecords, decommissionRecords, getToolById, tools } = useData();
  
  if (!authenticatedUser) {
    return <div className="text-center py-10">Inicia sesión para ver tu perfil.</div>;
  }

  const user = authenticatedUser;

  const userLoanRecords = loanRecords.filter(r => r.userId === user.id);
  const userDecommissionRecords = decommissionRecords.filter(r => r.responsibleUserId === user.id);
  const overdueLoans = tools.filter(t => t.currentUser === user.id && t.status === ToolStatus.Borrowed && t.estimatedReturnAt && new Date(t.estimatedReturnAt) < new Date()).length;
  const recentActivity = userLoanRecords.sort((a,b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* User Card */}
      <div className="bg-brand-surface rounded-lg shadow-sm p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          className="h-24 w-24 rounded-full object-cover ring-4 ring-white"
          src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`}
          alt="User avatar"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-brand-text-primary">{user.name}</h1>
          <p className="text-md text-brand-text-secondary">{user.role}</p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              Zonas de Acceso
            </span>
            {(user.accessZones || []).map(zone => (
                <span key={zone} className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                    {zone}
                </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total de Préstamos" value={userLoanRecords.length} icon={ClipboardDocumentListIcon} />
        <StatCard title="Herramientas de Baja" value={userDecommissionRecords.length} icon={WrenchScrewdriverIcon} />
        <StatCard title="Préstamos Vencidos" value={overdueLoans} icon={ExclamationTriangleIcon} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Decommission Requests */}
        <div className="bg-brand-surface rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold p-5 border-b border-gray-200">Mis Solicitudes de Baja</h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Herramienta</th>
                            <th className="px-6 py-3 hidden md:table-cell">Fecha</th>
                            <th className="px-6 py-3">Estado de Reposición</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userDecommissionRecords.map(record => {
                            const tool = getToolById(record.toolId);
                            return (
                                <tr key={record.toolId} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tool?.name || record.toolId}</td>
                                    <td className="px-6 py-4 hidden md:table-cell">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {record.replacementStatus}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                        {userDecommissionRecords.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-6 text-gray-500">No has registrado ninguna baja.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-brand-surface rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold p-5 border-b border-gray-200">Actividad Reciente</h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Herramienta</th>
                            <th className="px-6 py-3">Acción</th>
                            <th className="px-6 py-3 hidden md:table-cell">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map(record => {
                             const tool = getToolById(record.toolId);
                             return (
                                 <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tool?.name || record.toolId}</td>
                                    <td className="px-6 py-4">
                                        {record.checkinDate ? (
                                             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Devolución</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Préstamo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">{new Date(record.checkoutDate).toLocaleString()}</td>
                                </tr>
                             )
                        })}
                         {recentActivity.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-6 text-gray-500">No tienes actividad reciente.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
