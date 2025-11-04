
import React, { useState, useEffect, FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from './common/Modal';
import { User, UserRole } from '../types';
import { CameraIcon } from './common/Icon';

interface UserFormModalProps {
  userToEdit?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const UserFormModal: React.FC<UserFormModalProps> = ({ userToEdit, onClose, onSuccess }) => {
  const { addUser, updateUser } = useData();
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>({
    id: '',
    name: '',
    role: UserRole.Operator,
    avatarUrl: '',
    accessZones: [],
    password: '',
  });
  const [accessZonesStr, setAccessZonesStr] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        password: '',
      });
      setAccessZonesStr((userToEdit.accessZones || []).join(', '));
      setAvatarPreview(userToEdit.avatarUrl);
    } else {
      setFormData({
        id: `USER-${Date.now().toString().slice(-4)}`,
        name: '',
        role: UserRole.Operator,
        avatarUrl: '',
        accessZones: [],
        password: '',
      });
      setAccessZonesStr('');
      setAvatarPreview(undefined);
    }
  }, [userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const previewUrl = URL.createObjectURL(file);
          setAvatarPreview(previewUrl);
          const base64 = await fileToBase64(file);
          setFormData(prev => ({ ...prev, avatarUrl: base64 }));
      }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalAccessZones = accessZonesStr.split(',').map(zone => zone.trim()).filter(Boolean);

    if (userToEdit) {
        const payload: User = {
            ...userToEdit,
            name: formData.name!,
            role: formData.role!,
            avatarUrl: formData.avatarUrl,
            accessZones: finalAccessZones,
        };
        // Only update password if a new one is entered
        if (formData.password) {
            payload.password = formData.password;
        }
        updateUser(payload);
    } else {
        const payload: User = {
            ...formData,
            accessZones: finalAccessZones,
        } as User;
        addUser(payload);
    }
    onSuccess();
  };

  const title = userToEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario';

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-brand-text-primary">Foto de Perfil</label>
                <div className="mt-1 flex flex-col items-center">
                    <span className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                        {avatarPreview ? (
                            <img className="h-full w-full object-cover" src={avatarPreview} alt="Avatar Preview" />
                        ) : (
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    </span>
                    <label htmlFor="avatar-upload" className="mt-2 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                        <span>Cambiar</span>
                        <input id="avatar-upload" name="avatarUrl" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*"/>
                    </label>
                </div>
            </div>
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brand-text-primary">Nombre Completo</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="input-field mt-1" />
                </div>
                <div>
                    <label htmlFor="id" className="block text-sm font-medium text-brand-text-primary">ID de Usuario (Código)</label>
                    <input type="text" name="id" id="id" value={formData.id} onChange={handleChange} required disabled={!!userToEdit} className="input-field mt-1 disabled:bg-gray-100" />
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-brand-text-primary">Rol</label>
                  <select name="role" id="role" value={formData.role} onChange={handleChange} required className="input-field mt-1">
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="password"className="block text-sm font-medium text-brand-text-primary">Contraseña</label>
                  <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    value={formData.password}
                    onChange={handleChange} 
                    required={!userToEdit} 
                    className="input-field mt-1"
                    placeholder={userToEdit ? "Dejar en blanco para no cambiar" : ""}
                  />
                </div>
            </div>
             <div>
              <label htmlFor="accessZones" className="block text-sm font-medium text-brand-text-primary">Zonas de Acceso</label>
              <input type="text" name="accessZones" id="accessZones" value={accessZonesStr} onChange={(e) => setAccessZonesStr(e.target.value)} placeholder="Taller, Almacén A,..." className="input-field mt-1" />
              <p className="text-xs text-gray-500 mt-1">Separar zonas por comas. Usar '*' para acceso total.</p>
            </div>
        </div>
        <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-800">Guardar Cambios</button>
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
      `}</style>
    </Modal>
  );
};
