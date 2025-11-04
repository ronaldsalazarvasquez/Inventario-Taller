import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { Tool, ToolCategory, ToolStatus } from '../types';
import { CameraIcon, DocumentCheckIcon } from './common/Icon';

interface ToolFormModalProps {
  toolToEdit?: Tool | null;
  assignmentTargetUserId?: string | null;
  viewMode?: string;
  isAdmin?: boolean;
  currentUserId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

export const ToolFormModal: React.FC<ToolFormModalProps> = ({ 
  toolToEdit, 
  assignmentTargetUserId,
  viewMode,
  isAdmin,
  currentUserId,
  onClose, 
  onSuccess 
}) => {
  const { addTool, updateTool, users } = useData();
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: '',
    category: ToolCategory.Mechanic,
    brand: '',
    location: '',
    acquisitionDate: getTodayString(),
    lifespan: 12,
    observations: '',
    imageUrl: '',
    procedureUrl: '',
    isMeasuringInstrument: false,
    hasCertification: false,
    lastCalibrationDate: '',
    nextCalibrationDate: '',
    calibrationCertificateType: 'file',
    calibrationCertificateValue: '',
  });
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [certificateFileName, setCertificateFileName] = useState<string | undefined>(undefined);
  const [certificateInputType, setCertificateInputType] = useState<'file' | 'url'>('file');
  
  // Estado para controlar la asignación (solo para usuarios normales)
  const [assignmentChoice, setAssignmentChoice] = useState<'common' | 'personal'>(
    assignmentTargetUserId ? 'personal' : 'common'
  );

  useEffect(() => {
    if (toolToEdit) {
      const toolData = { ...toolToEdit };
      if (!toolData.calibrationCertificateType) {
        toolData.calibrationCertificateType = 'file';
      }
      setFormData(toolData);
      setImagePreview(toolToEdit.imageUrl);
      setCertificateInputType(toolToEdit.calibrationCertificateType || 'file');
      if (toolToEdit.calibrationCertificateType === 'file' && toolToEdit.calibrationCertificateValue) {
        setCertificateFileName("Certificado.pdf");
      }
    } else {
      // Configurar asignación inicial según el viewMode
      if (assignmentTargetUserId) {
        setAssignmentChoice('personal');
      } else {
        setAssignmentChoice('common');
      }
    }
  }, [toolToEdit, assignmentTargetUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target.type === 'checkbox' && e.target instanceof HTMLInputElement;
    const checked = isCheckbox ? e.target.checked : undefined;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: isCheckbox ? checked : value };
        if (name === 'isMeasuringInstrument' && !checked) {
            newState.hasCertification = false;
        }
        if (name === 'hasCertification' && !checked) {
            newState.lastCalibrationDate = '';
            newState.nextCalibrationDate = '';
            newState.calibrationCertificateType = 'file';
            newState.calibrationCertificateValue = '';
            setCertificateFileName(undefined);
            setCertificateInputType('file');
        }
        return newState;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      const base64Image = await fileToBase64(file);
      setFormData(prev => ({ ...prev, imageUrl: base64Image }));
    }
  };
  
  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFileName(file.name);
      const base64Pdf = await fileToBase64(file);
      setFormData(prev => ({ ...prev, calibrationCertificateValue: base64Pdf, calibrationCertificateType: 'file' }));
    }
  };

  const handleCertificateTypeChange = (type: 'file' | 'url') => {
    setCertificateInputType(type);
    setFormData(prev => ({ ...prev, calibrationCertificateValue: '', calibrationCertificateType: type }));
    setCertificateFileName(undefined);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (toolToEdit) {
      updateTool(formData as Tool);
    } else {
      // Determinar el currentUser según la elección o el contexto
      let finalCurrentUser = '';
      
      if (isAdmin) {
        // Admin: usar el assignmentTargetUserId directamente
        finalCurrentUser = assignmentTargetUserId || '';
      } else {
        // Usuario normal: usar la elección del radio button
        if (assignmentChoice === 'personal' && currentUserId) {
          finalCurrentUser = currentUserId;
        } else {
          finalCurrentUser = '';
        }
      }
      
      const newTool = {
        ...formData,
        currentUser: finalCurrentUser,
        status: ToolStatus.Available,
      };
      
      addTool(newTool as any);
    }
    onSuccess();
  };
  
  const setNextCalibration = (months: number) => {
      if(formData.lastCalibrationDate) {
          const lastDate = new Date(formData.lastCalibrationDate);
          lastDate.setMonth(lastDate.getMonth() + months);
          setFormData(prev => ({...prev, nextCalibrationDate: lastDate.toISOString().split('T')[0]}));
      }
  }

  const title = toolToEdit ? 'Editar Herramienta' : 'Añadir Nueva Herramienta';
  
  // Obtener nombre del usuario asignado (para mostrar en el mensaje)
  const assignedUserName = assignmentTargetUserId 
    ? users.find(u => u.id === assignmentTargetUserId)?.name 
    : null;

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensaje contextual de asignación */}
        {!toolToEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {isAdmin ? (
              <p className="text-sm text-blue-800">
                <strong>Asignación:</strong>{' '}
                {assignmentTargetUserId 
                  ? `Esta herramienta se añadirá al inventario personal de ${assignedUserName}`
                  : 'Esta herramienta se añadirá como herramienta de uso común'}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-blue-900">¿Dónde deseas añadir esta herramienta?</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentChoice"
                      value="common"
                      checked={assignmentChoice === 'common'}
                      onChange={() => setAssignmentChoice('common')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-blue-800">Uso Común</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="assignmentChoice"
                      value="personal"
                      checked={assignmentChoice === 'personal'}
                      onChange={() => setAssignmentChoice('personal')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-blue-800">Mi Inventario Personal</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Fields */}
          <div className="md:col-span-2 space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full input-field"/>
                </div>
                <div>
                    <label htmlFor="id" className="block text-sm font-medium">Código/ID</label>
                    <input type="text" name="id" value={formData.id} onChange={handleChange} required={!toolToEdit} disabled={!!toolToEdit} className="mt-1 w-full input-field disabled:bg-gray-100"/>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium">Categoría</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full input-field">
                        {Object.values(ToolCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium">Marca</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 w-full input-field"/>
                </div>
             </div>
             <div>
                <label htmlFor="location" className="block text-sm font-medium">Ubicación</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 w-full input-field"/>
            </div>
          </div>
          {/* Image Upload */}
          <div className="md:col-span-1">
             <label className="block text-sm font-medium">Imagen de Referencia</label>
             <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 w-auto object-contain" />
                ) : (
                    <div className="space-y-1 text-center">
                        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-blue-700">
                            <span>Subir imagen</span>
                            <input id="image-upload" name="imageUrl" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        {/* Calibration Section */}
        <div className="pt-4 border-t">
             <div className="flex items-center">
                <input type="checkbox" name="isMeasuringInstrument" checked={!!formData.isMeasuringInstrument} onChange={handleChange} className="h-4 w-4 text-brand-primary rounded" />
                <label htmlFor="isMeasuringInstrument" className="ml-2 block text-sm font-medium">Es un Instrumento de Medición</label>
            </div>
            {formData.isMeasuringInstrument && (
                <div className="mt-4 pl-6 space-y-4">
                     <div className="flex items-center">
                        <input type="checkbox" name="hasCertification" checked={!!formData.hasCertification} onChange={handleChange} className="h-4 w-4 text-brand-primary rounded" />
                        <label htmlFor="hasCertification" className="ml-2 block text-sm font-medium">Tiene Certificación de Calibración</label>
                    </div>
                    {formData.hasCertification && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md">
                            <div>
                                <label className="block text-sm font-medium">Última Calibración</label>
                                <input type="date" name="lastCalibrationDate" value={formData.lastCalibrationDate} onChange={handleChange} className="mt-1 w-full input-field"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Próxima Calibración</label>
                                <input type="date" name="nextCalibrationDate" value={formData.nextCalibrationDate} onChange={handleChange} className="mt-1 w-full input-field"/>
                                <div className="mt-1 flex gap-2">
                                    <button type="button" onClick={() => setNextCalibration(6)} className="cal-btn">6M</button>
                                    <button type="button" onClick={() => setNextCalibration(12)} className="cal-btn">1A</button>
                                    <button type="button" onClick={() => setNextCalibration(60)} className="cal-btn">5A</button>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium">Adjuntar Certificado (PDF)</label>
                                <div className="mt-1">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center"><input type="radio" name="certType" value="file" checked={certificateInputType === 'file'} onChange={() => handleCertificateTypeChange('file')} className="h-4 w-4 text-brand-primary" /> <span className="ml-2 text-sm">Subir Archivo</span></label>
                                        <label className="flex items-center"><input type="radio" name="certType" value="url" checked={certificateInputType === 'url'} onChange={() => handleCertificateTypeChange('url')} className="h-4 w-4 text-brand-primary" /> <span className="ml-2 text-sm">Enlazar URL</span></label>
                                    </div>
                                    {certificateInputType === 'file' ? (
                                        <label htmlFor="cert-upload" className="mt-2 cursor-pointer flex items-center gap-2 text-sm p-2 border rounded-md text-gray-600 hover:bg-gray-50">
                                            <DocumentCheckIcon className="w-5 h-5 text-brand-secondary"/>
                                            <span>{certificateFileName || 'Seleccionar archivo...'}</span>
                                        </label>
                                    ) : (
                                        <input type="url" name="calibrationCertificateValue" value={formData.calibrationCertificateValue} onChange={handleChange} placeholder="https://ejemplo.com/certificado.pdf" className="mt-2 w-full input-field"/>
                                    )}
                                </div>
                                <input id="cert-upload" type="file" className="sr-only" onChange={handleCertificateChange} accept=".pdf" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        <div className="pt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800">{toolToEdit ? 'Guardar Cambios' : 'Crear Herramienta'}</button>
        </div>
      </form>
      <style>{`
        .input-field {
            display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #D1D5DB;
            border-radius: 0.375rem;
            box-shadow: sm;
        }
        .input-field:focus {
            outline: none;
            --tw-ring-color: #1E3A8A;
            box-shadow: 0 0 0 2px var(--tw-ring-color);
        }
        .cal-btn {
            padding: 0.125rem 0.5rem;
            font-size: 0.75rem;
            border: 1px solid #D1D5DB;
            border-radius: 9999px;
            background-color: #F9FAFB;
            color: #4B5563;
        }
        .cal-btn:hover {
            background-color: #F3F4F6;
        }
      `}</style>
    </Modal>
  );
};