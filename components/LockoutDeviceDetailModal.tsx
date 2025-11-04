// components/LockoutDeviceDetailModal.tsx

import React from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { LockoutDeviceType } from '../types';

interface Props {
  deviceId: string;
  onClose: () => void;
}

export const LockoutDeviceDetailModal: React.FC<Props> = ({ deviceId, onClose }) => {
  const { lockoutDevices, lockoutUsageRecords, users } = useData();
  const device = lockoutDevices.find(d => d.id === deviceId);
  
  const usageHistory = lockoutUsageRecords
    .filter(r => r.deviceId === deviceId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!device) return null;

  return (
    <Modal onClose={onClose} title="Detalles del Dispositivo LOTO">
      <div className="space-y-6">
        {/* Imagen y datos básicos */}
        <div className="flex items-start gap-4">
          <img
            src={device.imageUrl || 'https://placehold.co/120x120/fee2e2/dc2626?text=LOTO'}
            alt={device.name}
            className="w-32 h-32 object-cover rounded-lg border-2 border-red-300"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{device.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{device.id}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                device.type === LockoutDeviceType.Electric
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {device.type}
              </span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                {device.status}
              </span>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Marca:</span>
            <p className="text-gray-900">{device.brand}</p>
          </div>
          {device.color && (
            <div>
              <span className="font-medium text-gray-700">Color:</span>
              <p className="text-gray-900">{device.color}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Ubicación:</span>
            <p className="text-gray-900">{device.location}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Fecha de Adquisición:</span>
            <p className="text-gray-900">{new Date(device.acquisitionDate).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        {device.observations && (
          <div>
            <span className="font-medium text-gray-700 text-sm">Observaciones:</span>
            <p className="text-gray-900 text-sm mt-1">{device.observations}</p>
          </div>
        )}

        {/* Historial de uso */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Historial de Uso</h3>
          {usageHistory.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay registros de uso</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {usageHistory.map(record => {
                const user = users.find(u => u.id === record.userId);
                const isActive = !record.endDate;
                
                return (
                  <div key={record.id} className={`p-3 rounded-lg border ${
                    isActive ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-900">{user?.name || 'Usuario desconocido'}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">
                          En uso
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Ubicación:</strong> {record.lockLocation}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Motivo:</strong> {record.lockReason}
                    </p>
                    {record.workPermitNumber && (
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Permiso:</strong> {record.workPermitNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(record.startDate).toLocaleString('es-ES')}
                      {record.endDate && ` - ${new Date(record.endDate).toLocaleString('es-ES')}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};