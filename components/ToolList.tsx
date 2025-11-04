import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Tool, ToolStatus, UserRole } from '../types';
import { STATUS_STYLES } from '../constants';
import { ToolDetailModal } from './ToolDetailModal';
import { PlusCircleIcon, UsersIcon, WrenchScrewdriverIcon } from './common/Icon';
import { ToolFormModal } from './ToolFormModal';

const isOverdue = (tool: Tool): boolean => {
  if (tool.status !== ToolStatus.Borrowed || !tool.estimatedReturnAt) return false;
  return new Date(tool.estimatedReturnAt) < new Date();
};

type ViewMode = 'all' | 'common' | 'personal' | 'by-user';
type CommonToolType = 'all' | 'mechanical' | 'electrical';

export const ToolList: React.FC = () => {
  const { tools, users, authenticatedUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ToolStatus | 'all'>('all');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [showDecommissioned, setShowDecommissioned] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const isAdmin = authenticatedUser?.role === UserRole.Administrator;
  const isTechnician = authenticatedUser?.role !== UserRole.Administrator;

  // ViewMode inicial según rol
  const [viewMode, setViewMode] = useState<ViewMode>(isAdmin ? 'all' : 'common');
  const [commonToolType, setCommonToolType] = useState<CommonToolType>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // —————————— HELPER: DETERMINAR ASIGNACIÓN AL CREAR ——————————
  const getAssignmentTarget = (): string | null => {
    if (viewMode === 'common') return null; // Uso común
    if (viewMode === 'personal' && authenticatedUser) return authenticatedUser.id;
    if (viewMode === 'by-user' && isAdmin && selectedUserId) return selectedUserId;
    return null; // fallback: uso común
  };

  // —————————— FILTRADO PRINCIPAL ——————————
  const baseTools = useMemo(() => {
    let filtered = showDecommissioned ? tools : tools.filter(t => t.status !== ToolStatus.Decommissioned);

    switch (viewMode) {
      case 'common':
        filtered = filtered.filter(t => !t.currentUser || t.currentUser === '');
        if (commonToolType === 'mechanical') {
          filtered = filtered.filter(t =>
            t.category.toLowerCase().includes('mecánica') ||
            t.category.toLowerCase().includes('mecanica')
          );
        } else if (commonToolType === 'electrical') {
          filtered = filtered.filter(t =>
            t.category.toLowerCase().includes('eléctrica') ||
            t.category.toLowerCase().includes('electrica')
          );
        }
        break;

      case 'personal':
        if (authenticatedUser) {
          filtered = filtered.filter(t => t.currentUser === authenticatedUser.id);
        }
        break;

      case 'by-user':
        if (isAdmin && selectedUserId) {
          filtered = filtered.filter(t => t.currentUser === selectedUserId);
        }
        break;

      default:
        break;
    }

    return filtered;
  }, [tools, showDecommissioned, viewMode, commonToolType, selectedUserId, authenticatedUser, isAdmin]);

  // —————————— FILTRO DE BUSQUEDA ——————————
  const filteredTools = useMemo(() => {
    return baseTools.filter(tool => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [baseTools, searchTerm, statusFilter]);

  // —————————— ESTADÍSTICAS ——————————
  const stats = useMemo(() => {
    const total = filteredTools.length;
    const available = filteredTools.filter(t => t.status === ToolStatus.Available).length;
    const borrowed = filteredTools.filter(t => t.status === ToolStatus.Borrowed).length;
    const overdue = filteredTools.filter(t => isOverdue(t)).length;
    return { total, available, borrowed, overdue };
  }, [filteredTools]);

  // —————————— CAMBIO DE MODO DE VISTA ——————————
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchTerm('');
    setStatusFilter('all');
    setCommonToolType('all');
    setSelectedUserId('');
  };

  // —————————— HANDLER PARA ABRIR MODAL DE AÑADIR ——————————
  const handleAddToolClick = () => {
    if (viewMode === 'by-user' && isAdmin && !selectedUserId) {
      alert('Por favor, selecciona un usuario para añadir la herramienta a su inventario personal.');
      return;
    }
    setIsFormModalOpen(true);
  };

  // —————————— RENDER PRINCIPAL ——————————
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* ————— ENCABEZADO ————— */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Inventario de Herramientas</h1>
              <p className="mt-1 text-sm text-gray-500">
                Busca, filtra y gestiona todas las herramientas del taller.
              </p>
            </div>
            <button
              onClick={handleAddToolClick}
              className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Añadir Herramienta
            </button>
          </div>

          {/* ————— ESTADÍSTICAS ————— */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.available}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-600">Prestadas</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.borrowed}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-600">Vencidas</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
          </div>
        </div>

        {/* ————— TABS MODO DE VISTA ————— */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
            {isAdmin && (
              <button
                onClick={() => handleViewModeChange('all')}
                className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  viewMode === 'all'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todas las Herramientas
              </button>
            )}
            <button
              onClick={() => handleViewModeChange('common')}
              className={`py-4 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                viewMode === 'common'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <WrenchScrewdriverIcon className="h-4 w-4" /> Uso Común
            </button>
            <button
              onClick={() => handleViewModeChange('personal')}
              className={`py-4 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                viewMode === 'personal'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-4 w-4" /> Mi Inventario Personal
            </button>
            {isAdmin && (
              <button
                onClick={() => handleViewModeChange('by-user')}
                className={`py-4 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                  viewMode === 'by-user'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UsersIcon className="h-4 w-4" /> Por Usuario
              </button>
            )}
          </nav>
        </div>

        {/* ————— FILTROS ————— */}
        <div className="p-6 space-y-4 bg-gray-50">
          {viewMode === 'common' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCommonToolType('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  commonToolType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setCommonToolType('mechanical')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  commonToolType === 'mechanical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Mecánicas
              </button>
              <button
                onClick={() => setCommonToolType('electrical')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  commonToolType === 'electrical'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Eléctricas
              </button>
            </div>
          )}

          {viewMode === 'by-user' && isAdmin && (
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar usuario...</option>
              {users
                .filter(u => u.role !== UserRole.Administrator)
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, código o marca..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ToolStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              {Object.values(ToolStatus)
                .filter(s => s !== ToolStatus.Decommissioned)
                .map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showDecommissioned}
                onChange={e => setShowDecommissioned(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Mostrar dadas de baja
            </label>
          </div>
        </div>

        {/* ————— TABLA ————— */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Imagen</th>
                <th className="px-6 py-3 text-left">Código</th>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left hidden md:table-cell">Categoría</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left hidden lg:table-cell">Usuario</th>
                <th className="px-6 py-3 text-left hidden sm:table-cell">Ubicación</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTools.map(tool => {
                const user = users.find(u => u.id === tool.currentUser);
                const overdue = isOverdue(tool);
                const statusStyle = overdue ? { bg: 'bg-red-100', text: 'text-red-800' } : STATUS_STYLES[tool.status];
                const isCommonTool = !tool.currentUser || tool.currentUser === '';
                return (
                  <tr key={tool.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={tool.imageUrl || 'https://placehold.co/64x64/f3f4f6/9ca3af?text=N/A'}
                        alt={tool.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{tool.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{tool.name}</span>
                        {isCommonTool && (
                          <span className="text-xs text-blue-600 font-normal">Uso común</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">{tool.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {overdue ? 'Vencido' : tool.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">{user?.name ?? '---'}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">{tool.location}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedToolId(tool.id)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-lg font-medium">No se encontraron herramientas</p>
              <p className="mt-1 text-sm">
                {viewMode === 'by-user' && !selectedUserId
                  ? 'Selecciona un usuario para ver su inventario'
                  : 'Intenta ajustar los filtros de búsqueda'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ————— MODALES ————— */}
      {selectedToolId && (
        <ToolDetailModal toolId={selectedToolId} onClose={() => setSelectedToolId(null)} />
      )}

      {isFormModalOpen && (
        <ToolFormModal
          assignmentTargetUserId={getAssignmentTarget()}
          viewMode={viewMode}
          isAdmin={isAdmin}
          currentUserId={authenticatedUser?.id}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={() => setIsFormModalOpen(false)}
        />
      )}
    </>
  );
};