import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Tool, ToolStatus } from '../../types';
import { FunnelIcon, SearchIcon } from '../common/Icon';
import { ToolDetailModal } from '../ToolDetailModal';

const isOverdue = (tool: Tool): boolean => {
    if (tool.status !== ToolStatus.Borrowed || !tool.estimatedReturnAt) return false;
    return new Date(tool.estimatedReturnAt) < new Date();
}

export const LoanReportTable: React.FC = () => {
    const { tools, users } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'overdue'>('all');
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

    const loanedTools = useMemo(() => {
        return tools.filter(tool => tool.status === ToolStatus.Borrowed);
    }, [tools]);
    
    const filteredLoans = useMemo(() => {
        return loanedTools.filter(tool => {
            const user = users.find(u => u.id === tool.currentUser);
            const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  tool.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (user && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesFilter = filter === 'all' || (filter === 'overdue' && isOverdue(tool));

            return matchesSearch && matchesFilter;
        });
    }, [loanedTools, users, searchTerm, filter]);

    return (
        <>
            <div className="bg-brand-surface rounded-lg shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-brand-text-primary">Reporte Detallado de Préstamos</h2>
                    <p className="mt-1 text-sm text-brand-text-secondary">Analiza todas las herramientas actualmente en préstamo.</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar por herramienta o usuario..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FunnelIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value as 'all' | 'overdue')}
                                className="w-full appearance-none py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="all">Todos los Préstamos</option>
                                <option value="overdue">Solo Vencidos</option>
                            </select>
                        </div>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-6 py-3">Herramienta</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3 hidden md:table-cell">Fecha Préstamo</th>
                                <th className="px-6 py-3 hidden md:table-cell">Devolución Estimada</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLoans.map(tool => {
                                const user = users.find(u => u.id === tool.currentUser);
                                const overdue = isOverdue(tool);
                                return (
                                    <tr key={tool.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{tool.name} <span className="block text-xs font-mono text-gray-500">{tool.id}</span></td>
                                        <td className="px-6 py-4">{user?.name ?? 'N/A'}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">{tool.borrowedAt ? new Date(tool.borrowedAt).toLocaleString() : 'N/A'}</td>
                                        <td className={`px-6 py-4 hidden md:table-cell ${overdue ? 'text-red-600 font-bold' : ''}`}>{tool.estimatedReturnAt ? new Date(tool.estimatedReturnAt).toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${overdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {overdue ? 'Vencido' : 'En Préstamo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedToolId(tool.id)}
                                                className="font-medium text-brand-primary hover:underline"
                                            >
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                 {filteredLoans.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No se encontraron préstamos con los filtros actuales.</p>
                    </div>
                )}
            </div>
             {selectedToolId && (
                <ToolDetailModal
                    toolId={selectedToolId}
                    onClose={() => setSelectedToolId(null)}
                />
            )}
        </>
    );
};