import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Tool, ToolStatus, LoanRecord, MaintenanceRecord, NotificationType } from '../types';
import { 
  ArrowRightLeftIcon, WrenchScrewdriverIcon, BellAlertIcon, DocumentCheckIcon, 
  ClockIcon, CheckIcon, ArrowUturnLeftIcon, Cog6ToothIcon, UsersIcon, 
  ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon 
} from './common/Icon';
import { STATUS_STYLES } from '../constants';

interface DashboardProps {
    setView: (view: 'dashboard' | 'tools' | 'checkinout' | 'reports' | 'settings' | 'users' | 'loto') => void;
}

interface ActivityLog {
  id: string;
  type: 'checkout' | 'checkin' | 'maintenance' | 'decommission';
  toolId: string;
  toolName: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    gradient: string;
    subtitle?: string;
}> = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <div className="group relative overflow-hidden rounded-xl p-[1px] transition-all duration-300 hover:scale-105">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
    <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-5 h-full">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
    </div>
  </div>
);

const ActivityLogItem: React.FC<{ activity: ActivityLog }> = ({ activity }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-l-4 border-gray-200 hover:border-blue-400 pl-4 py-3 hover:bg-blue-50/50 transition-all rounded-r">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0 mt-0.5`}>
          <activity.icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{activity.toolName}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {activity.type === 'checkout' && '📤 Préstamo'}
                {activity.type === 'checkin' && '📥 Devolución'}
                {activity.type === 'maintenance' && '🔧 Mantenimiento'}
                {activity.type === 'decommission' && '❌ Baja'}
                {' por '}<span className="font-medium">{activity.userName}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-medium text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
          {activity.details && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1"
            >
              {expanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
              {expanded ? 'Ocultar' : 'Ver'} detalles
            </button>
          )}
          {expanded && activity.details && (
            <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">{activity.details}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const isOverdue = (tool: Tool): boolean => {
    if (tool.status !== ToolStatus.Borrowed || !tool.estimatedReturnAt) return false;
    return new Date(tool.estimatedReturnAt) < new Date();
};

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { tools, users, loanRecords, maintenanceRecords, decommissionRecords, settings, lockoutUsageRecords } = useData();
  const [activityFilter, setActivityFilter] = useState<'all' | 'checkout' | 'checkin' | 'maintenance'>('all');
  const [showActivityLog, setShowActivityLog] = useState(true);

  // Estadísticas
  const stats = useMemo(() => ({
    total: tools.filter(t => t.status !== ToolStatus.Decommissioned).length,
    available: tools.filter(t => t.status === ToolStatus.Available).length,
    borrowed: tools.filter(t => t.status === ToolStatus.Borrowed).length,
    maintenance: tools.filter(t => t.status === ToolStatus.InMaintenance).length,
    overdue: tools.filter(isOverdue).length,
    decommissioned: tools.filter(t => t.status === ToolStatus.Decommissioned).length,
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
    };
  }, [tools, settings.calibrationWarningDays]);

  // Log completo de actividades
  const activityLog = useMemo(() => {
    const activities: ActivityLog[] = [];

    // Préstamos (checkout)
    loanRecords.forEach(loan => {
      const tool = tools.find(t => t.id === loan.toolId);
      const user = users.find(u => u.id === loan.userId);
      if (tool && user) {
        activities.push({
          id: `checkout-${loan.id}`,
          type: 'checkout',
          toolId: tool.id,
          toolName: tool.name,
          userId: user.id,
          userName: user.name,
          timestamp: loan.checkoutDate,
          details: `Turno: ${loan.shift}${loan.notes ? ` | Notas: ${loan.notes}` : ''}`,
          icon: ArrowRightLeftIcon,
          color: 'bg-blue-500',
        });

        // Devoluciones (checkin)
        if (loan.checkinDate) {
          activities.push({
            id: `checkin-${loan.id}`,
            type: 'checkin',
            toolId: tool.id,
            toolName: tool.name,
            userId: user.id,
            userName: user.name,
            timestamp: loan.checkinDate,
            details: `Duración: ${Math.round((new Date(loan.checkinDate).getTime() - new Date(loan.checkoutDate).getTime()) / (1000 * 60 * 60))} horas`,
            icon: CheckIcon,
            color: 'bg-green-500',
          });
        }
      }
    });

    // Mantenimientos
    maintenanceRecords.forEach(maint => {
      const tool = tools.find(t => t.id === maint.toolId);
      if (tool) {
        activities.push({
          id: `maint-${maint.id}`,
          type: 'maintenance',
          toolId: tool.id,
          toolName: tool.name,
          userId: 'system',
          userName: maint.company,
          timestamp: maint.date,
          details: `${maint.type} | ${maint.description}`,
          icon: Cog6ToothIcon,
          color: 'bg-purple-500',
        });
      }
    });

    // Bajas
    decommissionRecords.forEach(dec => {
      const tool = tools.find(t => t.id === dec.toolId);
      const user = users.find(u => u.id === dec.responsibleUserId);
      if (tool && user) {
        activities.push({
          id: `decom-${dec.toolId}`,
          type: 'decommission',
          toolId: tool.id,
          toolName: tool.name,
          userId: user.id,
          userName: user.name,
          timestamp: dec.date,
          details: `Motivo: ${dec.reason} | ${dec.description}`,
          icon: ExclamationTriangleIcon,
          color: 'bg-red-500',
        });
      }
    });

    // Ordenar por fecha (más reciente primero)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [loanRecords, maintenanceRecords, decommissionRecords, tools, users]);

  // Filtrar actividades
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activityLog;
    return activityLog.filter(a => a.type === activityFilter);
  }, [activityLog, activityFilter]);

  // Herramientas actualmente prestadas
  const currentlyBorrowed = useMemo(() => 
    tools.filter(t => t.status === ToolStatus.Borrowed)
      .sort((a,b) => new Date(b.borrowedAt!).getTime() - new Date(a.borrowedAt!).getTime()),
    [tools]
  );

  const utilizationRate = stats.total > 0 ? Math.round((stats.borrowed / stats.total) * 100) : 0;
  const availabilityRate = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard de Control</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Monitoreo en tiempo real</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Sistema Activo</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-5 h-5" />
          Estado del Inventario
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard 
            title="Total Activas" 
            value={stats.total} 
            icon={WrenchScrewdriverIcon} 
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard 
            title="Disponibles" 
            value={stats.available} 
            icon={DocumentCheckIcon} 
            gradient="from-emerald-500 to-teal-600"
            subtitle={`${availabilityRate}%`}
          />
          <StatCard 
            title="En Préstamo" 
            value={stats.borrowed} 
            icon={ArrowRightLeftIcon} 
            gradient="from-amber-500 to-orange-600"
            subtitle={`${utilizationRate}%`}
          />
          <StatCard 
            title="Mantenimiento" 
            value={stats.maintenance} 
            icon={Cog6ToothIcon} 
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard 
            title="Vencidos" 
            value={stats.overdue} 
            icon={BellAlertIcon} 
            gradient="from-red-500 to-rose-600"
          />
          <StatCard 
            title="Dadas de Baja" 
            value={stats.decommissioned} 
            icon={ExclamationTriangleIcon} 
            gradient="from-gray-500 to-gray-700"
          />
        </div>
      </div>

      {/* Calibración */}
      {calibrationStats.total > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DocumentCheckIcon className="w-5 h-5" />
            Estado de Calibración
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard 
              title="Total Instrumentos" 
              value={calibrationStats.total} 
              icon={DocumentCheckIcon} 
              gradient="from-slate-600 to-slate-800"
            />
            <StatCard 
              title="Vigentes" 
              value={calibrationStats.valid} 
              icon={CheckIcon} 
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard 
              title="Por Vencer" 
              value={calibrationStats.expiringSoon} 
              icon={ClockIcon} 
              gradient="from-amber-500 to-yellow-600"
            />
            <StatCard 
              title="Vencidos" 
              value={calibrationStats.expired} 
              icon={BellAlertIcon} 
              gradient="from-red-500 to-pink-600"
            />
          </div>
        </div>
      )}

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Herramientas Actualmente Prestadas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ArrowRightLeftIcon className="w-5 h-5 text-blue-600" />
              Estado Actual - En Préstamo
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
              {currentlyBorrowed.length}
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentlyBorrowed.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay herramientas en préstamo</p>
            ) : (
              currentlyBorrowed.map(tool => {
                const user = users.find(u => u.id === tool.currentUser);
                const overdue = isOverdue(tool);
                return (
                  <div key={tool.id} className={`p-3 rounded-lg border-2 ${overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{tool.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          <UsersIcon className="inline w-3 h-3 mr-1" />
                          {user?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <ClockIcon className="inline w-3 h-3 mr-1" />
                          Desde: {new Date(tool.borrowedAt!).toLocaleString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        overdue ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {overdue ? 'VENCIDO' : 'ACTIVO'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Log de Actividades */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              <ClockIcon className="w-5 h-5 text-purple-600" />
              Log de Actividades
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showActivityLog ? 'rotate-180' : ''}`} />
            </button>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
              {filteredActivities.length}
            </span>
          </div>

          {showActivityLog && (
            <>
              {/* Filtros */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActivityFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activityFilter === 'all' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas ({activityLog.length})
                </button>
                <button
                  onClick={() => setActivityFilter('checkout')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activityFilter === 'checkout' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📤 Préstamos
                </button>
                <button
                  onClick={() => setActivityFilter('checkin')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activityFilter === 'checkin' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📥 Devoluciones
                </button>
                <button
                  onClick={() => setActivityFilter('maintenance')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    activityFilter === 'maintenance' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔧 Mantenimiento
                </button>
              </div>

              {/* Lista de actividades */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredActivities.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay actividades registradas</p>
                ) : (
                  filteredActivities.slice(0, 50).map(activity => (
                    <ActivityLogItem key={activity.id} activity={activity} />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};