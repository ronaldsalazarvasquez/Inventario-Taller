import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { ToolStatus, Shift, Tool } from '../types';
import { 
  ClockIcon, CheckCircleIcon, ExclamationCircleIcon, 
  WrenchScrewdriverIcon, ArrowRightLeftIcon, DocumentTextIcon,
  CalendarIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon,
  PrinterIcon, ArrowDownTrayIcon, CheckIcon, UsersIcon, 
  Cog6ToothIcon, ExclamationTriangleIcon, ChevronRightIcon
} from './common/Icon';

interface ShiftReport {
  id: string;
  shift: Shift;
  date: string;
  startTime: string;
  endTime: string;
  totalTools: number;
  available: number;
  borrowed: number;
  maintenance: number;
  overdue: number;
  checkouts: number;
  checkins: number;
  borrowedTools: Array<{
    toolId: string;
    toolName: string;
    userId: string;
    userName: string;
    borrowedAt: string;
    estimatedReturn?: string;
    isOverdue: boolean;
  }>;
  completionRate: number;
  status: 'complete' | 'incomplete' | 'warning';
}

const ShiftBadge: React.FC<{ shift: Shift }> = ({ shift }) => {
  const colors = {
    [Shift.T1]: 'from-blue-500 to-blue-600',
    [Shift.T2]: 'from-yellow-300 to-yellow-400', // color amarillo más sutil
    [Shift.T3]: 'from-purple-500 to-indigo-600',
  };
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${colors[shift]} shadow-sm`}>
      {shift}
    </div>
  );
};

const CircularProgress: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 60 }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const color = percentage >= 80 ? '#10b981' : percentage >= 50 ? '#d6bb6f' : '#ef4444'; // amarillo más suave para medio
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
};

const MiniStatCard: React.FC<{ 
  value: number; 
  label: string;
  icon: React.ElementType;
  color: string;
}> = ({ value, label, icon: Icon, color }) => (
  <div className="flex items-center gap-2">
    <div className={`w-8 h-8 rounded-md ${color} flex items-center justify-center`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const ShiftReportCard: React.FC<{ 
  report: ShiftReport; 
  onExpand: () => void; 
  isExpanded: boolean;
}> = ({ report, onExpand, isExpanded }) => {
  const statusConfig = {
    complete: { gradient: 'from-green-400 to-green-500', icon: '✓', text: 'Todo en orden' },
    warning: { gradient: 'from-yellow-200 to-yellow-300', icon: '⚠', text: 'Requiere atención' }, // amarillo más suave
    incomplete: { gradient: 'from-red-400 to-red-500', icon: '✕', text: 'Incompleto' },
  };
  
  const config = statusConfig[report.status];
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header con gradiente */}
      <div className={`bg-gradient-to-r ${config.gradient} p-4 text-gray-900 flex justify-between items-center`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShiftBadge shift={report.shift} />
            <span className="text-sm font-medium opacity-90">{config.text}</span>
          </div>
          <p className="text-base font-semibold">
            {new Date(report.date).toLocaleDateString('es-ES', { 
              weekday: 'short', 
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <p className="text-xs opacity-80 mt-0.5">
            {report.startTime} - {report.endTime}
          </p>
        </div>
        <div className="text-3xl font-bold select-none">{config.icon}</div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-5">
        {/* Progreso circular y estadísticas */}
        <div className="flex items-center justify-between">
          <CircularProgress percentage={report.completionRate} size={60} />
          
          <div className="flex-1 ml-4 space-y-3">
            <MiniStatCard 
              value={report.available} 
              label="Disponibles" 
              icon={CheckCircleIcon}
              color="bg-green-400"
            />
            <MiniStatCard 
              value={report.borrowed} 
              label="En préstamo" 
              icon={ArrowRightLeftIcon}
              color="bg-blue-400"
            />
          </div>
        </div>

        {/* Actividad del turno */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-purple-700">{report.checkouts}</p>
                <p className="text-xs text-purple-600 font-medium mt-0.5">Préstamos</p>
              </div>
              <ArrowRightLeftIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-teal-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-teal-700">{report.checkins}</p>
                <p className="text-xs text-teal-600 font-medium mt-0.5">Devoluciones</p>
              </div>
              <CheckIcon className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>

        {/* Alertas (si existen) */}
        {(report.overdue > 0 || report.maintenance > 0) && (
          <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Alertas del turno</p>
                <div className="space-y-1 text-xs text-red-600">
                  {report.overdue > 0 && (
                    <p>• {report.overdue} herramienta{report.overdue > 1 ? 's' : ''} vencida{report.overdue > 1 ? 's' : ''}</p>
                  )}
                  {report.maintenance > 0 && (
                    <p>• {report.maintenance} en mantenimiento</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón expandir */}
        {report.borrowedTools.length > 0 && (
          <button
            onClick={onExpand}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-gray-700"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                Ocultar detalles
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                Ver {report.borrowedTools.length} herramienta{report.borrowedTools.length > 1 ? 's' : ''} prestada{report.borrowedTools.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        )}

        {/* Lista expandible */}
        {isExpanded && report.borrowedTools.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {report.borrowedTools.map((tool, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-md flex items-center gap-2 ${
                  tool.isOverdue 
                    ? 'bg-red-50 border-l-4 border-red-400' 
                    : 'bg-gray-50'
                }`}
              >
                <WrenchScrewdriverIcon className={`w-4 h-4 flex-shrink-0 ${tool.isOverdue ? 'text-red-600' : 'text-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{tool.toolName}</p>
                  <p className="text-xs text-gray-600">{tool.userName}</p>
                </div>
                {tool.isOverdue && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                    VENCIDO
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 mt-5 pt-5 border-t border-gray-200">
          <button className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm">
            <PrinterIcon className="w-4 h-4" />
            Imprimir
          </button>
          <button className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-sm">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export const Reports: React.FC = () => {
  const { tools, loanRecords, users } = useData();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<Shift | 'all'>('all');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  // Generar reportes por turno
  const shiftReports = useMemo(() => {
    const reports: ShiftReport[] = [];
    const today = new Date();
    
    // Generar reportes para los últimos 7 días
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generar reporte para cada turno
      Object.values(Shift).forEach(shift => {
        const shiftStart = new Date(dateStr);
        const shiftEnd = new Date(dateStr);
        
        // Definir horarios de turno
        if (shift === Shift.T1) {
          shiftStart.setHours(8, 0, 0);
          shiftEnd.setHours(16, 0, 0);
        } else if (shift === Shift.T2) {
          shiftStart.setHours(16, 0, 0);
          shiftEnd.setHours(23, 59, 59);
        } else {
          shiftStart.setHours(0, 0, 0);
          shiftEnd.setHours(8, 0, 0);
        }
        
        // Filtrar préstamos del turno
        const shiftLoans = loanRecords.filter(loan => {
          const loanDate = new Date(loan.checkoutDate);
          return loanDate >= shiftStart && loanDate <= shiftEnd;
        });
        
        // Contar devoluciones del turno
        const shiftCheckins = loanRecords.filter(loan => {
          if (!loan.checkinDate) return false;
          const checkinDate = new Date(loan.checkinDate);
          return checkinDate >= shiftStart && checkinDate <= shiftEnd;
        }).length;
        
        // Herramientas prestadas al final del turno
        const borrowedAtEndOfShift = tools.filter(tool => {
          if (tool.status !== ToolStatus.Borrowed || !tool.borrowedAt) return false;
          const borrowedDate = new Date(tool.borrowedAt);
          return borrowedDate <= shiftEnd;
        });
        
        const borrowedTools = borrowedAtEndOfShift.map(tool => {
          const user = users.find(u => u.id === tool.currentUser);
          const isOverdue = tool.estimatedReturnAt 
            ? new Date(tool.estimatedReturnAt) < shiftEnd 
            : false;
          
          return {
            toolId: tool.id,
            toolName: tool.name,
            userId: tool.currentUser || '',
            userName: user?.name || 'N/A',
            borrowedAt: tool.borrowedAt!,
            estimatedReturn: tool.estimatedReturnAt,
            isOverdue,
          };
        });
        
        const totalTools = tools.filter(t => t.status !== ToolStatus.Decommissioned).length;
        const available = tools.filter(t => t.status === ToolStatus.Available).length;
        const maintenance = tools.filter(t => t.status === ToolStatus.InMaintenance).length;
        const overdue = borrowedTools.filter(t => t.isOverdue).length;
        const completionRate = totalTools > 0 ? Math.round((available / totalTools) * 100) : 100;
        
        // Determinar estado del reporte
        let status: 'complete' | 'incomplete' | 'warning' = 'complete';
        if (overdue > 0 || maintenance > 0) {
          status = 'warning';
        }
        if (borrowedTools.length > totalTools * 0.5) {
          status = 'incomplete';
        }
        
        reports.push({
          id: `${dateStr}-${shift}`,
          shift,
          date: dateStr,
          startTime: shift === Shift.T1 ? '08:00' : shift === Shift.T2 ? '16:00' : '00:00',
          endTime: shift === Shift.T1 ? '16:00' : shift === Shift.T2 ? '00:00' : '08:00',
          totalTools,
          available,
          borrowed: borrowedTools.length,
          maintenance,
          overdue,
          checkouts: shiftLoans.length,
          checkins: shiftCheckins,
          borrowedTools,
          completionRate,
          status,
        });
      });
    }
    
    return reports.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      
      const shiftOrder = { [Shift.T1]: 1, [Shift.T2]: 2, [Shift.T3]: 3 };
      return shiftOrder[b.shift] - shiftOrder[a.shift];
    });
  }, [tools, loanRecords, users]);

  // Filtrar reportes
  const filteredReports = useMemo(() => {
    return shiftReports.filter(report => {
      const matchesDate = !selectedDate || report.date === selectedDate;
      const matchesShift = selectedShift === 'all' || report.shift === selectedShift;
      return matchesDate && matchesShift;
    });
  }, [shiftReports, selectedDate, selectedShift]);

  const toggleExpand = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header minimalista */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reportes por Turno</h1>
          <p className="text-gray-500">Monitoreo automático del estado de herramientas</p>
        </div>
        <DocumentTextIcon className="w-10 h-10 text-blue-500" />
      </div>

      {/* Filtros compactos */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Turno</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as Shift | 'all')}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">Todos</option>
              <option value={Shift.T1}>{Shift.T1}</option>
              <option value={Shift.T2}>{Shift.T2}</option>
              <option value={Shift.T3}>{Shift.T3}</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setSelectedShift('all');
            }}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      {filteredReports.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{filteredReports.length}</span>
          reporte{filteredReports.length !== 1 ? 's' : ''} encontrado{filteredReports.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-md p-10 text-center">
            <DocumentTextIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No se encontraron reportes</p>
            <p className="text-sm text-gray-400 mt-2">Intenta ajustar los filtros</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <ShiftReportCard
              key={report.id}
              report={report}
              isExpanded={expandedReports.has(report.id)}
              onExpand={() => toggleExpand(report.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};