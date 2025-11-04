import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ToolStatus, ToolCategory } from '../types';
import { ToolStatusChart } from './charts/ToolStatusChart';
import { UserActivityChart } from './charts/UserActivityChart';
import { LoanReportTable } from './reports/LoanReportTable';

export const Reports: React.FC = () => {
  const { tools, loanRecords, users } = useData();

  const statusData = useMemo(() => Object.values(ToolStatus)
    .filter(s => s !== ToolStatus.Decommissioned)
    .map(status => ({
        name: status,
        value: tools.filter(t => t.status === status).length,
    })).filter(item => item.value > 0), [tools]);

  const categoryData = useMemo(() => Object.values(ToolCategory).map(category => ({
      name: category,
      value: tools.filter(t => t.category === category && t.status !== ToolStatus.Decommissioned).length,
  })).filter(item => item.value > 0), [tools]);

  const userActivityData = useMemo(() => users.map(user => {
    const loanCount = loanRecords.filter(r => r.userId === user.id).length;
    return { name: user.name.split(' ')[0], value: loanCount }; // Show first name for brevity
  }).filter(item => item.value > 0)
    .sort((a,b) => b.value - a.value)
    .slice(0, 10), [users, loanRecords]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Reportes y Estadísticas</h1>
        <p className="mt-1 text-brand-text-secondary">Visualiza el uso de herramientas y el estado del inventario.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-surface rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Estado General de Herramientas</h2>
            {statusData.length > 0 ? <ToolStatusChart data={statusData} /> : <p className="text-center text-gray-500 py-10">No hay datos de estado para mostrar.</p>}
        </div>
        <div className="bg-brand-surface rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Uso por Categoría</h2>
            {categoryData.length > 0 ? <ToolStatusChart data={categoryData} /> : <p className="text-center text-gray-500 py-10">No hay datos de categoría para mostrar.</p>}
        </div>
      </div>

      <div className="bg-brand-surface rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Actividad por Usuario (Préstamos)</h2>
          {userActivityData.length > 0 ? <UserActivityChart data={userActivityData} /> : <p className="text-center text-gray-500 py-10">No hay préstamos registrados para mostrar.</p>}
      </div>
      
      <div>
        <LoanReportTable />
      </div>
    </div>
  );
};