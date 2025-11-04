import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { STATUS_STYLES } from '../constants';
import { ToolStatus } from '../types';
import { DecommissionToolModal } from './DecommissionToolModal';
import { DocumentTextIcon, TrashIcon, PencilSquareIcon, Cog6ToothIcon, CalendarDaysIcon, DocumentCheckIcon } from './common/Icon';
import { ReplacementTimeline } from './ReplacementTimeline';
import { ToolFormModal } from './ToolFormModal';
import { MaintenanceModal } from './MaintenanceModal';

interface ToolDetailModalProps {
  toolId: string;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={`py-2 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
    <dt className="text-sm font-medium text-brand-text-secondary">{label}</dt>
    <dd className="mt-1 text-sm text-brand-text-primary sm:mt-0 col-span-2">{children}</dd>
  </div>
);

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ toolId, onClose }) => {
  const { getToolById, users, decommissionRecords, getUserById } = useData();
  const [isDecommissionModalOpen, setDecommissionModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  const tool = getToolById(toolId);
  const decommissionRecord = decommissionRecords.find(r => r.toolId === toolId);

  if (!tool) return null;

  const handleModalSuccess = () => {
    setDecommissionModalOpen(false);
    setIsFormModalOpen(false);
    setIsMaintenanceModalOpen(false);
  };
  
  const openCertificate = () => {
    if (tool.calibrationCertificateValue) {
        if (tool.calibrationCertificateType === 'file') {
             const win = window.open("", "_blank");
             win?.document.write(`<iframe src="${tool.calibrationCertificateValue}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else if (tool.calibrationCertificateType === 'url') {
            window.open(tool.calibrationCertificateValue, '_blank', 'noopener,noreferrer');
        }
    }
  }

  if (tool.status === ToolStatus.Decommissioned && decommissionRecord) {
    const responsibleUser = getUserById(decommissionRecord.responsibleUserId);
    return (
      <Modal isOpen={true} onClose={onClose} title={`Baja: ${tool.name}`} size="4xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-brand-text-primary mb-2">Evidencia y Motivos</h3>
            <img 
                src={decommissionRecord.image || 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Sin+Imagen'} 
                alt="Evidencia de baja" 
                className="w-full h-auto object-cover rounded-lg shadow-md mb-4"
            />
             <dl className="divide-y divide-gray-200">
                <DetailRow label="Responsable de Baja">{responsibleUser?.name ?? 'N/A'}</DetailRow>
                <DetailRow label="Fecha de Baja">{new Date(decommissionRecord.date).toLocaleDateString()}</DetailRow>
                <DetailRow label="Motivo de Baja">{decommissionRecord.reason}</DetailRow>
                <DetailRow label="Descripción">{decommissionRecord.description}</DetailRow>
                <DetailRow label="Motivo de Reposición">{decommissionRecord.replacementReason}</DetailRow>
            </dl>
          </div>
          <div className="lg:col-span-3">
             <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Línea de Tiempo de Reposición</h3>
             <ReplacementTimeline record={decommissionRecord} />
          </div>
        </div>
      </Modal>
    );
  }

  const user = users.find(u => u.id === tool.currentUser);

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title="Detalles de la Herramienta" size="4xl">
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column */}
            <div className="md:w-1/3 flex-shrink-0">
                <img
                    src={tool.imageUrl || 'https://placehold.co/200x200/f3f4f6/9ca3af?text=N/A'}
                    alt={tool.name}
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                />
                 <div className="mt-6 flex flex-col space-y-3">
                     <button onClick={() => setIsFormModalOpen(true)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800">
                        <PencilSquareIcon className="w-5 h-5 mr-2" /> Editar
                    </button>
                    <button onClick={() => setIsMaintenanceModalOpen(true)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        <Cog6ToothIcon className="w-5 h-5 mr-2" /> Enviar a Mantenimiento
                    </button>
                     <button onClick={() => setDecommissionModalOpen(true)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400" disabled={tool.status === ToolStatus.Borrowed} title={tool.status === ToolStatus.Borrowed ? 'Devuelva la herramienta primero' : ''}>
                        <TrashIcon className="w-5 h-5 mr-2"/> Dar de Baja
                    </button>
                 </div>
            </div>

            {/* Right Column */}
            <div className="md:w-2/3">
                <h3 className="text-2xl font-bold text-brand-text-primary">{tool.name}</h3>
                <p className="font-mono text-xs text-brand-text-secondary bg-gray-100 px-2 py-1 rounded inline-block mt-1">{tool.id}</p>
                
                <div className="mt-4 border-t border-gray-200">
                     <dl className="divide-y divide-gray-200">
                        <DetailRow label="Estado">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[tool.status].bg} ${STATUS_STYLES[tool.status].text}`}>
                            {tool.status}
                            </span>
                        </DetailRow>
                        <DetailRow label="Categoría">{tool.category}</DetailRow>
                        <DetailRow label="Marca">{tool.brand}</DetailRow>
                        <DetailRow label="Ubicación">{tool.location}</DetailRow>
                        <DetailRow label="Usuario Actual">{user?.name ?? '---'}</DetailRow>
                        <DetailRow label="Observaciones">{tool.observations || 'Ninguna'}</DetailRow>
                        <DetailRow label="Procedimiento">
                            {tool.procedureUrl ? <a href={tool.procedureUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Ver Documento</a> : 'No disponible'}
                        </DetailRow>
                    </dl>
                </div>

                {tool.isMeasuringInstrument && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-md font-semibold text-brand-text-primary mb-2 flex items-center">
                            <CalendarDaysIcon className="w-5 h-5 mr-2 text-brand-primary"/>
                            Información de Calibración
                        </h4>
                        {tool.hasCertification ? (
                             <dl className="divide-y divide-gray-200">
                                <DetailRow label="Última Calibración">{tool.lastCalibrationDate ? new Date(tool.lastCalibrationDate).toLocaleDateString() : 'N/A'}</DetailRow>
                                <DetailRow label="Próxima Calibración">{tool.nextCalibrationDate ? new Date(tool.nextCalibrationDate).toLocaleDateString() : 'N/A'}</DetailRow>
                                <DetailRow label="Certificado">
                                    {tool.calibrationCertificateValue ? (
                                        <button onClick={openCertificate} className="inline-flex items-center text-sm font-medium text-brand-secondary hover:text-emerald-700">
                                            <DocumentCheckIcon className="w-5 h-5 mr-1"/> Ver Certificado
                                        </button>
                                    ) : 'No adjunto'}
                                </DetailRow>
                            </dl>
                        ) : (
                            <p className="text-sm text-brand-text-secondary">Esta herramienta no cuenta con certificación de calibración.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
      </Modal>

      {isDecommissionModalOpen && <DecommissionToolModal tool={tool} onClose={() => setDecommissionModalOpen(false)} onSuccess={handleModalSuccess}/>}
      {isFormModalOpen && <ToolFormModal toolToEdit={tool} onClose={() => setIsFormModalOpen(false)} onSuccess={handleModalSuccess} />}
      {isMaintenanceModalOpen && <MaintenanceModal tool={tool} onClose={() => setIsMaintenanceModalOpen(false)} onSuccess={handleModalSuccess} />}
    </>
  );
};