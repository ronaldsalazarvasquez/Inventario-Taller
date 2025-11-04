import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { User, Tool, ToolStatus } from '../types';
import { QrCodeIcon } from './common/Icon';
import { STATUS_STYLES } from '../constants';

const InfoCard: React.FC<{ title: string; children: React.ReactNode; success: boolean }> = ({ title, children, success }) => (
    <div className={`border-l-4 ${success ? 'border-brand-secondary' : 'border-gray-300'} bg-brand-surface p-4 rounded-r-lg shadow-sm`}>
        <h3 className="font-bold text-lg mb-2 text-brand-text-primary">{title}</h3>
        {children}
    </div>
);

export const CheckInOut: React.FC = () => {
    const { users, tools, checkOutTool, checkInTool, getToolById, getUserById } = useData();
    const [userId, setUserId] = useState('');
    const [toolId, setToolId] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentTool, setCurrentTool] = useState<Tool | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const toolInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const user = users.find(u => u.id === userId);
        setCurrentUser(user || null);
        if (user) toolInputRef.current?.focus();
    }, [userId, users]);

    useEffect(() => {
        const tool = tools.find(t => t.id === toolId);
        setCurrentTool(tool || null);
    }, [toolId, tools]);

    const handleTransaction = () => {
        if (!currentUser || !currentTool) {
            setMessage({ type: 'error', text: 'Usuario o herramienta no válidos.' });
            return;
        }

        if (currentTool.status === ToolStatus.Available) {
            // Check out
            const returnDate = new Date();
            returnDate.setHours(returnDate.getHours() + 8); // Default 8 hour loan
            checkOutTool(currentUser.id, currentTool.id, returnDate);
            setMessage({ type: 'success', text: `Herramienta "${currentTool.name}" prestada a ${currentUser.name}.` });
        } else if (currentTool.status === ToolStatus.Borrowed) {
            // Check in
            if(currentTool.currentUser !== currentUser.id){
                setMessage({ type: 'error', text: `Esta herramienta fue prestada por otro usuario.` });
                return;
            }
            checkInTool(currentTool.id);
            setMessage({ type: 'success', text: `Herramienta "${currentTool.name}" devuelta.` });
        } else {
            setMessage({ type: 'error', text: `La herramienta no está disponible para préstamo (Estado: ${currentTool.status}).` });
        }
        
        // Reset after transaction
        setUserId('');
        setToolId('');
        setCurrentUser(null);
        setCurrentTool(null);
    };
    
    const actionText = currentTool?.status === ToolStatus.Available ? 'Realizar Préstamo' : 'Registrar Devolución';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-brand-surface rounded-lg shadow p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-center text-brand-text-primary">Registro de Préstamo y Devolución</h1>
                <p className="text-center mt-2 text-brand-text-secondary">Escanee el código del trabajador y luego el de la herramienta.</p>

                {message && (
                    <div className={`mt-6 p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-brand-text-primary mb-1">1. Escanear Código de Trabajador</label>
                            <div className="relative">
                                <input id="userId" type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="USER-XXX" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                                <QrCodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="toolId" className="block text-sm font-medium text-brand-text-primary mb-1">2. Escanear Código de Herramienta</label>
                             <div className="relative">
                                <input ref={toolInputRef} id="toolId" type="text" value={toolId} onChange={e => setToolId(e.target.value)} placeholder="TOOL-XXX" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary" disabled={!currentUser}/>
                                <QrCodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                            </div>
                        </div>
                        <button onClick={handleTransaction} disabled={!currentUser || !currentTool || currentTool.status === ToolStatus.InMaintenance || currentTool.status === ToolStatus.Decommissioned} className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                           {actionText}
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                       <InfoCard title="Información del Trabajador" success={!!currentUser}>
                            {currentUser ? (
                                <div>
                                    <p><span className="font-semibold">Nombre:</span> {currentUser.name}</p>
                                    <p><span className="font-semibold">Rol:</span> {currentUser.role}</p>
                                </div>
                            ) : <p className="text-sm text-gray-500">Esperando código de trabajador...</p>}
                        </InfoCard>
                         <InfoCard title="Información de la Herramienta" success={!!currentTool}>
                            {currentTool ? (
                                <div>
                                    <p><span className="font-semibold">Nombre:</span> {currentTool.name}</p>
                                    <p><span className="font-semibold">Estado:</span> 
                                     {/* Fix: STATUS_STYLES was not defined. It is now imported. */}
                                     <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_STYLES[currentTool.status].bg} ${STATUS_STYLES[currentTool.status].text}`}>
                                        {currentTool.status}
                                     </span>
                                    </p>
                                </div>
                            ) : <p className="text-sm text-gray-500">Esperando código de herramienta...</p>}
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
};