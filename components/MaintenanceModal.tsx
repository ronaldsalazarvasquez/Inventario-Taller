import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { Tool, MaintenanceType } from '../types';

interface MaintenanceModalProps {
  tool: Tool;
  onClose: () => void;
  onSuccess: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ tool, onClose, onSuccess }) => {
  const { sendToolToMaintenance } = useData();
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MaintenanceType>(MaintenanceType.Preventive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !description) {
        alert("Por favor, complete todos los campos.");
        return;
    }
    sendToolToMaintenance({
      toolId: tool.id,
      company,
      description,
      type,
    });
    onSuccess();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Enviar a Mantenimiento: ${tool.name}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-brand-text-primary">
            Empresa Responsable
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            placeholder="Ej: Servicios Técnicos S.A."
          />
        </div>
        <div>
            <label htmlFor="type" className="block text-sm font-medium text-brand-text-primary">Tipo de Mantenimiento</label>
            <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            >
                {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-brand-text-primary">
            Descripción del Trabajo a Realizar
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            placeholder="Ej: Calibración anual, cambio de escobillas..."
          />
        </div>
        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800"
          >
            Confirmar Envío
          </button>
        </div>
      </form>
    </Modal>
  );
};