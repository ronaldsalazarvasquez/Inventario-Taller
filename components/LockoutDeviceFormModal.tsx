import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { LockoutDeviceType, LockoutDeviceStatus } from '../types';
import { Modal } from './common/Modal';

interface Props {
  deviceId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LockoutDeviceFormModal: React.FC<Props> = ({ deviceId, onClose, onSuccess }) => {
  const { lockoutDevices, addLockoutDevice, updateLockoutDevice } = useData();
  const existingDevice = deviceId ? lockoutDevices.find(d => d.id === deviceId) : null;
  const isEditing = !!existingDevice;

  const [formData, setFormData] = useState({
    id: existingDevice?.id || '',
    name: existingDevice?.name || '',
    type: existingDevice?.type || LockoutDeviceType.Electric,
    status: existingDevice?.status || LockoutDeviceStatus.Available,
    brand: existingDevice?.brand || '',
    color: existingDevice?.color || '',
    acquisitionDate: existingDevice?.acquisitionDate || new Date().toISOString().split('T')[0],
    location: existingDevice?.location || '',
    observations: existingDevice?.observations || '',
    imageUrl: existingDevice?.imageUrl || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id.trim() || !formData.name.trim() || !formData.brand.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (isEditing) {
      updateLockoutDevice(deviceId!, formData);
    } else {
      addLockoutDevice(formData);
    }

    onSuccess();
  };

  return (
    <Modal onClose={onClose} title={isEditing ? 'Editar Dispositivo LOTO' : 'Añadir Dispositivo LOTO'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={e => handleChange('id', e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-gray-100"
              required
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.type}
              onChange={e => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {Object.values(LockoutDeviceType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {Object.values(LockoutDeviceStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={e => handleChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={e => handleChange('color', e.target.value)}
              placeholder="Ej: Rojo, Amarillo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Fecha de adquisición */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Adquisición
            </label>
            <input
              type="date"
              value={formData.acquisitionDate}
              onChange={e => handleChange('acquisitionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={formData.observations}
            onChange={e => handleChange('observations', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen del Dispositivo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-md border border-gray-200"
            />
          )}
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
            {isEditing ? 'Actualizar' : 'Añadir'}
          </button>
        </div>
      </form>
    </Modal>
  );
};