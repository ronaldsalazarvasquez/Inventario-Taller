// components/LOTO.tsx

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { LockoutDevice, LockoutDeviceStatus, LockoutDeviceType, UserRole } from '../types';
import { PlusCircleIcon, LockClosedIcon, ShieldCheckIcon } from './common/Icon';
import { LockoutDeviceFormModal } from './LockoutDeviceFormModal';
import { LockoutDeviceDetailModal } from './LockoutDeviceDetailModal';
import { LockoutUsageModal } from './LockoutUsageModal';

const STATUS_STYLES = {
  [LockoutDeviceStatus.Available]: { bg: 'bg-green-100', text: 'text-green-800' },
  [LockoutDeviceStatus.InUse]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [LockoutDeviceStatus.Damaged]: { bg: 'bg-red-100', text: 'text-red-800' },
  [LockoutDeviceStatus.OutOfService]: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

type TabView = 'inventory' | 'in-use';

export const LOTO: React.FC = () => {
  const { lockoutDevices, lockoutUsageRecords, users, authenticatedUser } = useData();
  const [activeTab, setActiveTab] = useState<TabView>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<LockoutDeviceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LockoutDeviceStatus | 'all'>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [deviceToUse, setDeviceToUse] = useState<string | null>(null);

  const isAdmin = authenticatedUser?.role === UserRole.Administrator;

  // ========== FILTRADO DE INVENTARIO ==========
  const filteredInventory = useMemo(() => {
    return lockoutDevices.filter(device => {
      const matchesSearch =
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [lockoutDevices, searchTerm, typeFilter, statusFilter]);

  // ========== DISPOSITIVOS EN USO DEL USUARIO ==========
  const myDevicesInUse = useMemo(() => {
    if (!authenticatedUser) return [];
    
    const activeRecords = lockoutUsageRecords.filter(
      record => record.userId === authenticatedUser.id && !record.endDate
    );
    
    return activeRecords.map(record => {
      const device = lockoutDevices.find(d => d.id === record.deviceId);
      return { record, device };
    }).filter(item => item.device);
  }, [lockoutUsageRecords, lockoutDevices, authenticatedUser]);

  // ========== ESTADÍSTICAS ==========
  const stats = useMemo(() => {
    const total = lockoutDevices.length;
    const available = lockoutDevices.filter(d => d.status === LockoutDeviceStatus.Available).length;
    const inUse = lockoutDevices.filter(d => d.status === LockoutDeviceStatus.InUse).length;
    const electric = lockoutDevices.filter(d => d.type === LockoutDeviceType.Electric).length;
    const mechanical = lockoutDevices.filter(d => d.type === LockoutDeviceType.Mechanical).length;
    return { total, available, inUse, electric, mechanical };
  }, [lockoutDevices]);

  // ========== HANDLERS ==========
  const handleRegisterUsage = (deviceId: string) => {
    setDeviceToUse(deviceId);
    setIsUsageModalOpen(true);
  };

  const handleReturnDevice = (recordId: string) => {
    // Implementar lógica de devolución
    console.log('Devolver dispositivo:', recordId);
  };

  // ========== RENDER ==========
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* ENCABEZADO */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">LOTOTO - Dispositivos de Bloqueo</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Gestión de dispositivos de bloqueo y etiquetado (Lockout/Tagout)
                  </p>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsFormModalOpen(true)}
                className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Añadir Dispositivo
              </button>
            )}
          </div>

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.available}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-600">En Uso</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inUse}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Eléctricos</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.electric}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Mecánicos</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.mechanical}</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Inventario Completo
            </button>
            <button
              onClick={() => setActiveTab('in-use')}
              className={`py-4 flex items-center gap-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'in-use'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LockClosedIcon className="h-4 w-4" />
              Mis Dispositivos en Uso
              {myDevicesInUse.length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {myDevicesInUse.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        {activeTab === 'inventory' ? (
          <>
            {/* FILTROS */}
            <div className="p-6 space-y-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o marca..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as LockoutDeviceType | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="all">Todos los Tipos</option>
                  {Object.values(LockoutDeviceType).map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as LockoutDeviceStatus | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="all">Todos los Estados</option>
                  {Object.values(LockoutDeviceStatus).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLA DE INVENTARIO */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Imagen</th>
                    <th className="px-6 py-3 text-left">Código</th>
                    <th className="px-6 py-3 text-left">Nombre</th>
                    <th className="px-6 py-3 text-left">Tipo</th>
                    <th className="px-6 py-3 text-left">Estado</th>
                    <th className="px-6 py-3 text-left hidden lg:table-cell">Marca</th>
                    <th className="px-6 py-3 text-left hidden sm:table-cell">Ubicación</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(device => {
                    const statusStyle = STATUS_STYLES[device.status];
                    const canUse = device.status === LockoutDeviceStatus.Available;
                    
                    return (
                      <tr key={device.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img
                            src={device.imageUrl || 'https://placehold.co/64x64/fee2e2/dc2626?text=LOTO'}
                            alt={device.name}
                            className="w-12 h-12 object-cover rounded-md border-2 border-red-200"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{device.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{device.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            device.type === LockoutDeviceType.Electric
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {device.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">{device.brand}</td>
                        <td className="px-6 py-4 hidden sm:table-cell">{device.location}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedDeviceId(device.id)}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Detalles
                          </button>
                          {canUse && (
                            <button
                              onClick={() => handleRegisterUsage(device.id)}
                              className="text-red-600 hover:underline text-sm font-medium"
                            >
                              Usar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium">No se encontraron dispositivos</p>
                  <p className="mt-1 text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* PESTAÑA DE DISPOSITIVOS EN USO */
          <div className="p-6">
            {myDevicesInUse.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium">No tienes dispositivos en uso</p>
                <p className="mt-1 text-sm">Ve al inventario para registrar un bloqueo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myDevicesInUse.map(({ record, device }) => (
                  <div key={record.id} className="bg-white border-2 border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <img
                        src={device!.imageUrl || 'https://placehold.co/80x80/fee2e2/dc2626?text=LOTO'}
                        alt={device!.name}
                        className="w-20 h-20 object-cover rounded-md border-2 border-red-300"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{device!.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{device!.id}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                          device!.type === LockoutDeviceType.Electric
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {device!.type}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Ubicación del bloqueo:</span>
                        <p className="text-gray-600">{record.lockLocation}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Motivo:</span>
                        <p className="text-gray-600">{record.lockReason}</p>
                      </div>
                      {record.workPermitNumber && (
                        <div>
                          <span className="font-medium text-gray-700">Permiso de trabajo:</span>
                          <p className="text-gray-600 font-mono">{record.workPermitNumber}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Fecha de inicio:</span>
                        <p className="text-gray-600">{new Date(record.startDate).toLocaleString('es-ES')}</p>
                      </div>
                    </div>

                    {record.photoUrl && (
                      <div className="mt-3">
                        <img
                          src={record.photoUrl}
                          alt="Foto del bloqueo"
                          className="w-full h-32 object-cover rounded-md border border-gray-200"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleReturnDevice(record.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Devolver
                      </button>
                      <button
                        onClick={() => setSelectedDeviceId(device!.id)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES */}
      {isFormModalOpen && (
        <LockoutDeviceFormModal
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={() => setIsFormModalOpen(false)}
        />
      )}

      {selectedDeviceId && (
        <LockoutDeviceDetailModal
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(null)}
        />
      )}

      {isUsageModalOpen && deviceToUse && (
        <LockoutUsageModal
          deviceId={deviceToUse}
          onClose={() => {
            setIsUsageModalOpen(false);
            setDeviceToUse(null);
          }}
          onSuccess={() => {
            setIsUsageModalOpen(false);
            setDeviceToUse(null);
            setActiveTab('in-use');
          }}
        />
      )}
    </>
  );
};