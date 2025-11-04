import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Tool, ToolStatus } from '../types';
import { ArrowRightLeftIcon, WrenchScrewdriverIcon, BellAlertIcon, DocumentCheckIcon, ClockIcon } from './common/Icon';
import { STATUS_STYLES } from '../constants';

interface DashboardProps {
    setView: (view: 'dashboard' | 'tools' | 'checkinout' | 'reports' | 'settings') => void;
}

const CompactStatCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: React.ElementType; 
    gradient: string;
}> = ({ title, value, icon: Icon, gradient }) => (
  <div className="group relative overflow-hidden rounded-xl p-[1px] transition-all duration-300 hover:scale-105">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 h-full flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent" style={{
          backgroundImage: gradient.replace('from-', 'linear-gradient(to bottom right, ').replace(' to-', ', ')
        }}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const AlertItem: React.FC<{ type: 'warning' | 'error'; message: string; count: number }> = ({ type, message, count }) => {
  const styles = {
    warning: { gradient: 'from-amber-400 to-orange-500', icon: '⚠️' },
    error: { gradient: 'from-red-400 to-rose-500', icon: '🔴' },
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${styles[type].gradient} flex-shrink-0`}>
        <BellAlertIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{message}</p>
      </div>
      <div className={`text-xl font-bold bg-gradient-to-br ${styles[type].gradient} bg-clip-text text-transparent flex-shrink-0`}>
        {count}
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ percentage: number; gradient: string; label: string }> = ({ percentage, gradient, label }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className="font-bold text-gray-900">{percentage}%</span>
    </div>
    <div className="relative w-full bg-gray-200/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
      <div 
        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out shadow-lg`}
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      </div>
    </div>
  </div>
);

const isOverdue = (tool: Tool): boolean => {
    if (tool.status !== ToolStatus.Borrowed || !tool.estimatedReturnAt) return false;
    return new Date(tool.estimatedReturnAt) < new Date();
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { tools, users, settings } = useData();
  const [alertsPanelOpen, setAlertsPanelOpen] = useState(true);

  const stats = useMemo(() => ({
    total: tools.filter(t => t.status !== ToolStatus.Decommissioned).length,
    available: tools.filter(t => t.status === ToolStatus.Available).length,
    borrowed: tools.filter(t => t.status === ToolStatus.Borrowed).length,
    maintenance: tools.filter(t => t.status === ToolStatus.InMaintenance).length,
    overdue: tools.filter(isOverdue).length,
  }), [tools]);

  const calibrationStats = useMemo(() => {
    const measuringInstruments = tools.filter(t => t.isMeasuringInstrument && t.hasCertification && t.nextCalibrationDate);
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + settings.calibrationWarningDays);

    return {
        total: measuringInstruments.length,
        valid: measuringInstruments.filter(t => new Date(t.nextCalibrationDate!) >= now).length,
        expired: measuringInstruments.filter(t => new Date(t.nextCalibrationDate!) < now).length,
        expiringSoon: measuringInstruments.filter(t => {
            const nextCal = new Date(t.nextCalibrationDate!);
            return nextCal >= now && nextCal <= warningDate;
        }).length,
    }
  }, [tools, settings.calibrationWarningDays]);
  
  const recentActivity = useMemo(() => 
    tools.filter(t => t.status === ToolStatus.Borrowed)
      .sort((a,b) => new Date(b.borrowedAt!).getTime() - new Date(a.borrowedAt!).getTime())
      .slice(0, 5),
    [tools]
  );

  const utilizationRate = stats.total > 0 ? Math.round((stats.borrowed / stats.total) * 100) : 0;
  const availabilityRate = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;

  const hasAlerts = stats.overdue > 0 || calibrationStats.expired > 0 || calibrationStats.expiringSoon > 0;
  const totalAlerts = (stats.overdue > 0 ? 1 : 0) + (calibrationStats.expired > 0 ? 1 : 0) + (calibrationStats.expiringSoon > 0 ? 1 : 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Hero Header - Compacto */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard de Control</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Sistema de gestión inteligente</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Operativo</span>
          </div>
        </div>
      </div>

      {/* Layout Principal con Sidebar de Alertas en Desktop */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Contenido Principal */}
        <div className="flex-1 space-y-5">
          {/* Stats Grid - Con valores visibles */}
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">Inventario General</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <CompactStatCard 
                title="Total Activas" 
                value={stats.total} 
                icon={WrenchScrewdriverIcon} 
                gradient="from-blue-500 to-indigo-600"
              />
              <CompactStatCard 
                title="Disponibles" 
                value={stats.available} 
                icon={DocumentCheckIcon} 
                gradient="from-emerald-500 to-teal-600"
              />
              <CompactStatCard 
                title="En Préstamo" 
                value={stats.borrowed} 
                icon={ArrowRightLeftIcon} 
                gradient="from-amber-500 to-orange-600"
              />
              <CompactStatCard 
                title="Mantenimiento" 
                value={stats.maintenance} 
                icon={WrenchScrewdriverIcon} 
                gradient="from-violet-500 to-purple-600"
              />
              <CompactStatCard 
                title="Vencidos" 
                value={stats.overdue} 
                icon={BellAlertIcon} 
                gradient="from-red-500 to-rose-600"
              />
            </div>
          </div>

          {/* Calibration Stats - Con valores visibles */}
          {calibrationStats.total > 0 && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">Estado de Calibración</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <CompactStatCard 
                  title="Instrumentos Totales" 
                  value={calibrationStats.total} 
                  icon={DocumentCheckIcon} 
                  gradient="from-slate-600 to-slate-800"
                />
                <CompactStatCard 
                  title="Vigentes" 
                  value={calibrationStats.valid} 
                  icon={DocumentCheckIcon} 
                  gradient="from-emerald-500 to-green-600"
                />
                <CompactStatCard 
                  title="Próximos a Vencer" 
                  value={calibrationStats.expiringSoon} 
                  icon={ClockIcon} 
                  gradient="from-amber-500 to-yellow-600"
                />
                <CompactStatCard 
                  title="Vencidos" 
                  value={calibrationStats.expired} 
                  icon={BellAlertIcon} 
                  gradient="from-red-500 to-pink-600"
                />
              </div>
            </div>
          )}

          {/* Alertas en Mobile - Compacto */}
          {hasAlerts && (
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Alertas ({totalAlerts})
                </h2>
              </div>
              <div className="space-y-2">
                {stats.overdue > 0 && (
                  <AlertItem type="error" message="Préstamos vencidos" count={stats.overdue} />
                )}
                {calibrationStats.expired > 0 && (
                  <AlertItem type="error" message="Calibraciones vencidas" count={calibrationStats.expired} />
                )}
                {calibrationStats.expiringSoon > 0 && (
                  <AlertItem type="warning" message="Calibraciones por vencer" count={calibrationStats.expiringSoon} />
                )}
              </div>
            </div>
          )}

          {/* Recent Activity Table */}
          <div className="relative overflow-hidden rounded-2xl p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 opacity-50" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Actividad Reciente</h2>
                <p className="text-xs text-gray-600 mt-0.5">Últimos préstamos registrados</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Herramienta</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden sm:table-cell">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase hidden md:table-cell">Devolución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentActivity.map(tool => {
                      const user = users.find(u => u.id === tool.currentUser);
                      const overdue = isOverdue(tool);
                      return (
                        <tr key={tool.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all">
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-900 text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{user?.name ?? 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-medium hidden sm:table-cell">{user?.name ?? 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              overdue ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg' : STATUS_STYLES[tool.status].bg + ' ' + STATUS_STYLES[tool.status].text
                            }`}>
                              {overdue ? 'Vencido' : tool.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-xs font-semibold hidden md:table-cell ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                            {tool.estimatedReturnAt ? new Date(tool.estimatedReturnAt).toLocaleString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A'}
                          </td>
                        </tr>
                      )
                    })}
                    {recentActivity.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3">
                              <WrenchScrewdriverIcon className="w-10 h-10 opacity-50" />
                            </div>
                            <p className="text-sm font-semibold">No hay préstamos recientes</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Utilization Chart - Mobile */}
          <div className="lg:hidden relative overflow-hidden rounded-2xl p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-5">
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">Utilización</h3>
              <div className="space-y-4">
                <ProgressBar 
                  percentage={utilizationRate} 
                  gradient="from-amber-500 via-orange-500 to-red-500" 
                  label="En uso" 
                />
                <ProgressBar 
                  percentage={availabilityRate} 
                  gradient="from-emerald-500 via-teal-500 to-cyan-500" 
                  label="Disponibles" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Derecho - Desktop */}
        <div className="hidden lg:block w-80 xl:w-96 space-y-5">
          {/* Panel de Alertas Desplegable */}
          {hasAlerts && (
            <div className="relative overflow-hidden rounded-2xl p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500" />
              <div className="relative bg-gradient-to-br from-red-50 to-rose-50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setAlertsPanelOpen(!alertsPanelOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                      <BellAlertIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Alertas</h3>
                      <p className="text-xs text-gray-600">{totalAlerts} notificaciones</p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${alertsPanelOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {alertsPanelOpen && (
                  <div className="px-4 pb-4 space-y-2 max-h-96 overflow-y-auto">
                    {stats.overdue > 0 && (
                      <AlertItem type="error" message="Préstamos vencidos requieren atención" count={stats.overdue} />
                    )}
                    {calibrationStats.expired > 0 && (
                      <AlertItem type="error" message="Instrumentos con calibración vencida" count={calibrationStats.expired} />
                    )}
                    {calibrationStats.expiringSoon > 0 && (
                      <AlertItem type="warning" message="Calibraciones próximas a vencer" count={calibrationStats.expiringSoon} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shift Summary */}
          <div className="relative overflow-hidden rounded-2xl p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-500" />
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Turno Actual</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">Herramientas en préstamo</p>
              <div className="relative overflow-hidden rounded-xl p-[1px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500" />
                <div className="relative bg-white rounded-xl p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.borrowed}</span>
                    <span className="text-xs font-semibold text-gray-600">activos</span>
                  </div>
                  {stats.overdue > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Vencidos</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.overdue}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Utilization Chart */}
          <div className="relative overflow-hidden rounded-2xl p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-5">
              <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-5">Utilización</h3>
              <div className="space-y-5">
                <ProgressBar 
                  percentage={utilizationRate} 
                  gradient="from-amber-500 via-orange-500 to-red-500" 
                  label="En uso" 
                />
                <ProgressBar 
                  percentage={availabilityRate} 
                  gradient="from-emerald-500 via-teal-500 to-cyan-500" 
                  label="Disponibles" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};