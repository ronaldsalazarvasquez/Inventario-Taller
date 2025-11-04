import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { CameraIcon } from './common/Icon';

interface Props {
  deviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LockoutUsageModal: React.FC<Props> = ({ deviceId, onClose, onSuccess }) => {
  const { lockoutDevices, authenticatedUser, addLockoutUsageRecord } = useData();
  const device = lockoutDevices.find(d => d.id === deviceId);

  const [lockLocation, setLockLocation] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [workPermitNumber, setWorkPermitNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedUser || !device) return;

    if (!lockLocation.trim() || !lockReason.trim()) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    addLockoutUsageRecord({
      deviceId: device.id,
      userId: authenticatedUser.id,
      lockLocation: lockLocation.trim(),
      lockReason: lockReason.trim(),
      workPermitNumber: workPermitNumber.trim() || undefined,
      photoUrl: photoUrl || undefined,
      notes: notes.trim() || undefined,
    });

    onSuccess();
  };

  if (!device) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Registrar Uso de Dispositivo LOTO" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info del dispositivo */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <img
              src={device.imageUrl || 'https://placehold.co/60x60/fee2e2/dc2626?text=LOTO'}
              alt={device.name}
              className="w-16 h-16 object-cover rounded-md border-2 border-red-300"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{device.name}</h3>
              <p className="text-sm text-gray-600">{device.type}</p>
              <p className="text-xs text-gray-500 font-mono">{device.id}</p>
            </div>
          </div>
        </div>

        {/* Ubicación del bloqueo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación del Bloqueo <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={lockLocation}
            onChange={e => setLockLocation(e.target.value)}
            placeholder="Ej: Panel eléctrico A-3, Válvula principal, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
        </div>

        {/* Motivo del bloqueo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo del Bloqueo <span className="text-red-600">*</span>
          </label>
          <textarea
            value={lockReason}
            onChange={e => setLockReason(e.target.value)}
            placeholder="Describe el motivo del bloqueo..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          />
        </div>

        {/* Número de permiso de trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Permiso de Trabajo (Opcional)
          </label>
          <input
            type="text"
            value={workPermitNumber}
            onChange={e => setWorkPermitNumber(e.target.value)}
            placeholder="Ej: PT-2024-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Foto del bloqueo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto del Bloqueo (Opcional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-red-500 transition-colors">
              <CameraIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {photoUrl ? 'Cambiar foto' : 'Subir foto'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Preview"
              className="mt-2 w-full h-40 object-cover rounded-md border border-gray-200"
            />
          )}
        </div>

        {/* Notas adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Información adicional..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Registrar Uso
          </button>
        </div>
      </form>
    </Modal>
  );
};