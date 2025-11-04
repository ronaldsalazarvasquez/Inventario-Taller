import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { Tool } from '../types';
import { CameraIcon, TrashIcon, WrenchScrewdriverIcon } from './common/Icon';

interface DecommissionToolModalProps {
  tool: Tool;
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

export const DecommissionToolModal: React.FC<DecommissionToolModalProps> = ({ tool, onClose, onSuccess }) => {
    const { decommissionTool } = useData();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [replacementReason, setReplacementReason] = useState('');
    const [image, setImage] = useState<string | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagePreview(URL.createObjectURL(file));
            const base64Image = await fileToBase64(file);
            setImage(base64Image);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        decommissionTool({
            toolId: tool.id,
            reason,
            description,
            replacementReason,
            image,
        });
        setTimeout(() => {
            setIsSuccess(true);
        }, 500);
        setTimeout(() => {
            onSuccess();
        }, 2500); // Close modal after success animation
    };

    return (
    <Modal isOpen={true} onClose={onClose} title={`Dar de Baja: ${tool.name}`} size="lg">
        {!isSuccess ? (
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-brand-text-primary">Motivo de la Baja</label>
                        <input type="text" id="reason" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text-primary">Descripción del Estado</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                     <div>
                        <label htmlFor="replacementReason" className="block text-sm font-medium text-brand-text-primary">Motivo de la Reposición</label>
                        <textarea id="replacementReason" value={replacementReason} onChange={e => setReplacementReason(e.target.value)} rows={2} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" placeholder="Ej: Herramienta crítica, se requiere reemplazo..."/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-primary">Adjuntar Imagen de Evidencia</label>
                        <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-32 w-auto object-contain" />
                            ) : (
                                <div className="space-y-1 text-center">
                                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-blue-700 focus-within:outline-none">
                                            <span>Subir un archivo</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300">
                        {isSubmitting ? 'Procesando...' : 'Confirmar Baja'}
                    </button>
                </div>
            </form>
        ) : (
            <div className="text-center py-8 flex flex-col items-center justify-center h-64 overflow-hidden">
                <div className="relative w-full h-full">
                     <WrenchScrewdriverIcon className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 text-brand-accent animate-fall"/>
                     <TrashIcon className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 text-gray-400"/>
                </div>
                <h3 className="text-lg font-medium text-brand-text-primary mt-4">Herramienta Dada de Baja</h3>
                <p className="text-sm text-brand-text-secondary">El registro ha sido actualizado.</p>
            </div>
        )}
    </Modal>
    );
};