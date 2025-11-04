import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Tool, ToolStatus, LockoutDevice, LockoutDeviceStatus } from '../types';
import { QrCodeIcon, ShieldCheckIcon, ClockIcon, UsersIcon, MagnifyingGlassIcon, WrenchIcon, UserIcon } from './common/Icon';
import { STATUS_STYLES } from '../constants';

type ItemType = 'tool' | 'loto';

interface LoanItem {
  id: string;
  name: string;
  type: ItemType;
  imageUrl?: string;
  status: string;
  loanDate: Date;
  expectedReturnDate: Date;
  borrowerName: string;
  comments?: string;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
      active
        ? 'bg-brand-primary text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
  >
    {children}
  </button>
);

export const CheckInOut: React.FC = () => {
  const { 
    tools, 
    lockoutDevices, 
    authenticatedUser,
    checkOutTool, 
    checkInTool,
    addLockoutUsageRecord,
    endLockoutUsage,
    lockoutUsageRecords,
    loanRecords,
    users
  } = useData();

  const [activeTab, setActiveTab] = useState<'loan' | 'return'>('loan');
  const [itemType, setItemType] = useState<ItemType>('tool');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loanHours, setLoanHours] = useState(8);
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtrar items disponibles
  const availableItems = useMemo(() => {
    if (itemType === 'tool') {
      return tools
        .filter(t => t.status === ToolStatus.Available)
        .filter(t => 
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
      return lockoutDevices
        .filter(d => d.status === LockoutDeviceStatus.Available)
        .filter(d => 
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  }, [itemType, searchTerm, tools, lockoutDevices]);

  // Items prestados por el usuario actual
const myLoanedItems = useMemo(() => {
  if (!authenticatedUser) return [];

  const loanedItems: LoanItem[] = [];

  // Herramientas prestadas
  const myToolLoans = loanRecords.filter(
    loan => loan.userId === authenticatedUser.id && !loan.checkinDate
  );
  myToolLoans.forEach(loan => {
    const tool = tools.find(t => t.id === loan.toolId);
    if (tool) {
      loanedItems.push({
        id: tool.id,
        name: tool.name,
        type: 'tool',
        imageUrl: tool.imageUrl,
        status: tool.status,
        loanDate: new Date(loan.checkoutDate),
        expectedReturnDate: tool.estimatedReturnAt ? new Date(tool.estimatedReturnAt) : new Date(loan.checkoutDate),
        borrowerName: authenticatedUser.name,
        comments: loan.notes,
      });
    }
  });

  // Dispositivos LOTO en uso
  const myLotoUsage = lockoutUsageRecords.filter(
    record => record.userId === authenticatedUser.id && !record.endDate
  );
  myLotoUsage.forEach(record => {
    const device = lockoutDevices.find(d => d.id === record.deviceId);
    if (device) {
      loanedItems.push({
        id: device.id,
        name: device.name,
        type: 'loto',
        imageUrl: device.imageUrl,
        status: device.status,
        loanDate: new Date(record.startDate),
        expectedReturnDate: new Date(record.startDate), // LOTO no tiene fecha esperada
        borrowerName: authenticatedUser.name,
        comments: record.lockReason,
      });
    }
  });

  return loanedItems;
}, [authenticatedUser, loanRecords, lockoutUsageRecords, tools, lockoutDevices]);
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    if (itemType === 'tool') {
      return tools.find(t => t.id === selectedItemId);
    } else {
      return lockoutDevices.find(d => d.id === selectedItemId);
    }
  }, [selectedItemId, itemType, tools, lockoutDevices]);

  const handleLoan = () => {
    if (!authenticatedUser) {
      setMessage({ type: 'error', text: 'Debe iniciar sesión para realizar préstamos.' });
      return;
    }

    if (!selectedItemId) {
      setMessage({ type: 'error', text: 'Debe seleccionar un item.' });
      return;
    }

    if (!comments.trim()) {
      setMessage({ type: 'error', text: 'Debe agregar un comentario sobre el uso.' });
      return;
    }

    const returnDate = new Date();
    returnDate.setHours(returnDate.getHours() + loanHours);

    if (itemType === 'tool') {
      checkOutTool(authenticatedUser.id, selectedItemId, returnDate);
      setMessage({ 
        type: 'success', 
        text: `Herramienta "${selectedItem?.name}" prestada exitosamente.` 
      });
    } else {
      // Para LOTO
      addLockoutUsageRecord({
        deviceId: selectedItemId,
        userId: authenticatedUser.id,
        lockLocation: 'Préstamo general',
        lockReason: comments.trim(),
        notes: `Préstamo por ${loanHours} horas`,
      });
      setMessage({ 
        type: 'success', 
        text: `Dispositivo LOTO "${selectedItem?.name}" prestado exitosamente.` 
      });
    }

    // Reset form
    setSelectedItemId('');
    setSearchTerm('');
    setComments('');
    setLoanHours(8);
  };

  const handleReturn = (itemId: string, itemType: ItemType) => {
    if (!authenticatedUser) {
      setMessage({ type: 'error', text: 'Debe iniciar sesión para realizar devoluciones.' });
      return;
    }

    if (itemType === 'tool') {
      checkInTool(itemId);
      setMessage({ type: 'success', text: 'Herramienta devuelta exitosamente.' });
    } else {
      // Buscar el registro de uso activo
      const activeRecord = lockoutUsageRecords.find(
        r => r.deviceId === itemId && !r.endDate
      );
      if (activeRecord) {
        endLockoutUsage(activeRecord.id);
        setMessage({ type: 'success', text: 'Dispositivo LOTO devuelto exitosamente.' });
      }
    }
  };

  const getTimeRemaining = (expectedReturn: Date) => {
    const now = new Date();
    const diff = expectedReturn.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return <span className="text-red-600 font-semibold">Vencido</span>;
    } else if (hours < 2) {
      return <span className="text-orange-600 font-semibold">Por vencer ({hours}h {minutes}m)</span>;
    } else {
      return <span className="text-green-600">{hours}h {minutes}m restantes</span>;
    }
  };

  if (!authenticatedUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800">Debe iniciar sesión para acceder al sistema de préstamos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-brand-surface rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-brand-text-primary">Sistema de Préstamos</h1>
          <p className="text-brand-text-secondary mt-1">Gestión de préstamos y devoluciones</p>
          
          {/* Usuario actual */}
          <div className="mt-4 flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
            <UserIcon className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Usuario:</span>
            <span className="text-blue-800">{authenticatedUser.name}</span>
            <span className="text-xs text-blue-600 ml-2">({authenticatedUser.role})</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-2">
          <TabButton active={activeTab === 'loan'} onClick={() => setActiveTab('loan')}>
            Realizar Préstamo
          </TabButton>
          <TabButton active={activeTab === 'return'} onClick={() => setActiveTab('return')}>
            Devoluciones ({myLoanedItems.length})
          </TabButton>
        </div>

        {/* Messages */}
        {message && (
          <div className="mx-6 mt-4">
            <div className={`p-4 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
              <button 
                onClick={() => setMessage(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {activeTab === 'loan' ? (
            <div className="space-y-6">
              {/* Selector de tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Item</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setItemType('tool');
                      setSelectedItemId('');
                      setSearchTerm('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      itemType === 'tool'
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <WrenchIcon className="h-5 w-5" />
                    <span className="font-semibold">Herramientas</span>
                  </button>
                  <button
                    onClick={() => {
                      setItemType('loto');
                      setSelectedItemId('');
                      setSearchTerm('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                      itemType === 'loto'
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span className="font-semibold">Dispositivos LOTO</span>
                  </button>
                </div>
              </div>

              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar o Escanear {itemType === 'tool' ? 'Herramienta' : 'Dispositivo LOTO'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o código..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Lista de items disponibles */}
              {searchTerm && (
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {availableItems.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No se encontraron items disponibles</p>
                  ) : (
                    <div className="divide-y">
                      {availableItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItemId(item.id);
                            setSearchTerm('');
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <img
                            src={item.imageUrl || 'https://placehold.co/48x48/e5e7eb/6b7280?text=IMG'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{item.id}</p>
                          </div>
                          {itemType === 'tool' && (
                            <span className="text-xs text-gray-600">{(item as Tool).category}</span>
                          )}
                          {itemType === 'loto' && (
                            <span className="text-xs text-gray-600">{(item as LockoutDevice).type}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Item seleccionado */}
              {selectedItem && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Item Seleccionado</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedItem.imageUrl || 'https://placehold.co/80x80/e5e7eb/6b7280?text=IMG'}
                      alt={selectedItem.name}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-green-300"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{selectedItem.name}</p>
                      <p className="text-sm text-gray-600 font-mono">{selectedItem.id}</p>
                      {itemType === 'tool' && (
                        <p className="text-sm text-gray-600">Categoría: {(selectedItem as Tool).category}</p>
                      )}
                      {itemType === 'loto' && (
                        <p className="text-sm text-gray-600">Tipo: {(selectedItem as LockoutDevice).type}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Duración del préstamo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="inline h-4 w-4 mr-1" />
                  Duración del Préstamo (horas)
                </label>
                <select
                  value={loanHours}
                  onChange={e => setLoanHours(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas (1 turno)</option>
                  <option value={24}>24 horas (1 día)</option>
                  <option value={48}>48 horas (2 días)</option>
                  <option value={72}>72 horas (3 días)</option>
                  <option value={168}>1 semana</option>
                </select>
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo / Comentarios <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={3}
                  placeholder="Describe el motivo del préstamo, trabajo a realizar, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              {/* Botón de préstamo */}
              <button
                onClick={handleLoan}
                disabled={!selectedItemId || !comments.trim()}
                className="w-full py-4 px-6 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
              >
                Confirmar Préstamo
              </button>
            </div>
          ) : (
            /* TAB DE DEVOLUCIONES */
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Mis Items en Préstamo</h2>
              
              {myLoanedItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No tienes items en préstamo</p>
                  <p className="text-sm mt-2">Ve a la pestaña "Realizar Préstamo" para solicitar items</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myLoanedItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={item.imageUrl || 'https://placehold.co/64x64/e5e7eb/6b7280?text=IMG'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{item.name}</h3>
                              <p className="text-xs text-gray-500 font-mono">{item.id}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.type === 'tool' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type === 'tool' ? 'Herramienta' : 'LOTO'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Préstamo:</span>
                          <span className="font-medium">{item.loanDate.toLocaleString('es-ES')}</span>
                        </div>
                        {item.type === 'tool' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiempo restante:</span>
                            <span>{getTimeRemaining(item.expectedReturnDate)}</span>
                          </div>
                        )}
                        {item.comments && (
                          <div>
                            <span className="text-gray-600">Motivo:</span>
                            <p className="text-gray-900 text-xs mt-1 bg-gray-50 p-2 rounded">{item.comments}</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleReturn(item.id, item.type)}
                        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Devolver
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};