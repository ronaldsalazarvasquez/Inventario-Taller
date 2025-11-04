import React from 'react';
import { UserManagement } from './UserManagement';
import { useData } from '../context/DataContext';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-brand-surface rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-semibold leading-6 text-brand-text-primary">{title}</h2>
            <p className="mt-1 text-sm text-brand-text-secondary">{description}</p>
        </div>
        <div className="p-4 sm:p-6">
            {children}
        </div>
    </div>
);

const SettingsField: React.FC<{ label: string; description: string; children: React.ReactNode }> = ({ label, description, children }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
        <div className="text-sm font-medium text-brand-text-primary">
            <label>{label}</label>
            <p className="mt-1 text-xs text-gray-500 font-normal">{description}</p>
        </div>
        <div className="mt-2 sm:col-span-2 sm:mt-0">
            {children}
        </div>
    </div>
);

export const Settings: React.FC = () => {
    const { settings, updateSettings } = useData();
    
    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value;
        updateSettings({ [name]: finalValue });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Configuración del Sistema</h1>
                <p className="mt-1 text-brand-text-secondary">Ajusta los parámetros de funcionamiento de la aplicación.</p>
            </div>

            {/* General Settings */}
            <SettingsCard title="Configuración General" description="Ajustes básicos del sistema.">
                <div className="divide-y divide-gray-200">
                    <SettingsField label="Notificaciones por Correo" description="Alertas de devoluciones vencidas y mantenimiento.">
                        <label htmlFor="email-notifications" className="flex items-center">
                            <input id="email-notifications" type="checkbox" className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary" defaultChecked />
                            <span className="ml-3 text-sm font-medium">Activar notificaciones</span>
                        </label>
                    </SettingsField>

                    <SettingsField label="Correo del Supervisor" description="Dirección para recibir todas las notificaciones.">
                        <input type="email" defaultValue="supervisor@taller.com" className="w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </SettingsField>
                </div>
            </SettingsCard>
            
            {/* Calibration Settings */}
            <SettingsCard title="Configuración de Calibración" description="Define las alertas para instrumentos de medición.">
                 <div className="divide-y divide-gray-200">
                    <SettingsField label="Aviso de Vencimiento" description="Días de antelación para notificar una calibración próxima a vencer.">
                        <div className="flex items-center">
                            <input 
                                type="number" 
                                name="calibrationWarningDays"
                                value={settings.calibrationWarningDays}
                                onChange={handleSettingChange}
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" 
                            />
                            <span className="ml-2 text-sm">días</span>
                        </div>
                    </SettingsField>
                </div>
            </SettingsCard>

            {/* Reports Settings */}
            <SettingsCard title="Configuración de Reportes" description="Ajusta la generación de reportes automáticos.">
                <div className="divide-y divide-gray-200">
                    <SettingsField label="Frecuencia" description="Cada cuánto se deben generar y enviar los reportes.">
                        <select className="w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option>Al final de cada turno</option>
                            <option>Diariamente</option>
                            <option>Semanalmente</option>
                        </select>
                    </SettingsField>
                    <SettingsField label="Hora de Envío" description="Hora para el envío de reportes diarios o semanales.">
                         <input type="time" defaultValue="08:00" className="w-full max-w-xs px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </SettingsField>
                </div>
            </SettingsCard>

            {/* User Management */}
            <SettingsCard title="Gestión de Usuarios" description="Añade, edita o elimina usuarios del sistema.">
                <UserManagement />
            </SettingsCard>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={() => alert('Configuración guardada!')}
                    className="px-6 py-2 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                    Guardar Todos los Cambios
                </button>
            </div>
        </div>
    );
};