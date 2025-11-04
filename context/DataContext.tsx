import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Tool, User, LoanRecord, DecommissionRecord, MaintenanceRecord, 
  ToolStatus, Shift, ReplacementStatus, MaintenanceType, 
  Notification, NotificationType,
  LockoutDevice, LockoutUsageRecord, LockoutDeviceStatus 
} from '../types';
import { MOCK_TOOLS, MOCK_USERS, MOCK_LOAN_RECORDS, MOCK_LOCKOUT_DEVICES } from '../constants';

interface AppSettings {
    calibrationWarningDays: number;
}

interface DataContextType {
  tools: Tool[];
  users: User[];
  loanRecords: LoanRecord[];
  decommissionRecords: DecommissionRecord[];
  maintenanceRecords: MaintenanceRecord[];
  settings: AppSettings;
  notifications: Notification[];
  authenticatedUser: User | null;
  lockoutDevices: LockoutDevice[];
  lockoutUsageRecords: LockoutUsageRecord[];
  getToolById: (id: string) => Tool | undefined;
  getUserById: (id: string) => User | undefined;
  checkOutTool: (userId: string, toolId: string, estimatedReturn: Date) => void;
  checkInTool: (toolId: string) => void;
  updateTool: (updatedTool: Tool) => void;
  addTool: (newTool: Omit<Tool, 'status' | 'id'> & { id?: string }) => void;
  decommissionTool: (payload: { toolId: string; reason: string; description: string; image?: string; replacementReason: string; }) => void;
  updateReplacementStatus: (toolId: string, status: ReplacementStatus) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  sendToolToMaintenance: (payload: { toolId: string; company: string; description: string; type: MaintenanceType; }) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  markAllNotificationsAsRead: () => void;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  addLockoutDevice: (device: Omit<LockoutDevice, 'id'>) => void;
  updateLockoutDevice: (id: string, updates: Partial<LockoutDevice>) => void;
  deleteLockoutDevice: (id: string) => void;
  addLockoutUsageRecord: (data: Omit<LockoutUsageRecord, 'id' | 'startDate'>) => void;
  endLockoutUsage: (recordId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<Tool[]>(MOCK_TOOLS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>(MOCK_LOAN_RECORDS);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ calibrationWarningDays: 30 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [lockoutDevices, setLockoutDevices] = useState<LockoutDevice[]>(MOCK_LOCKOUT_DEVICES);
  const [lockoutUsageRecords, setLockoutUsageRecords] = useState<LockoutUsageRecord[]>([]);
  const [decommissionRecords, setDecommissionRecords] = useState<DecommissionRecord[]>([
    {
        toolId: 'MECH-003',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Desgaste excesivo',
        description: 'La mandíbula de la herramienta está completamente rota y no es seguro su uso.',
        image: 'https://placehold.co/400x300/e74c3c/ffffff?text=DA%C3%91O',
        responsibleUserId: 'USER-003',
        replacementReason: 'Herramienta crítica para operaciones de ensamblaje. Se necesita reemplazo urgente.',
        replacementStatus: ReplacementStatus.Seen,
    }
  ]);

  const login = (userId: string, password: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && user.password === password) {
        setAuthenticatedUser(user);
        return true;
    }
    return false;
  };

  const logout = () => {
      setAuthenticatedUser(null);
  };

  const addNotification = (type: NotificationType, message: string) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getToolById = (id: string) => tools.find(t => t.id === id);
  const getUserById = (id: string) => users.find(u => u.id === id);

  const getCurrentShift = (): Shift => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 16) return Shift.T1;
    if (hour >= 16 && hour < 24) return Shift.T2;
    return Shift.T3;
  };

  const checkOutTool = (userId: string, toolId: string, estimatedReturn: Date) => {
    const tool = getToolById(toolId);
    const user = getUserById(userId);
    if (!tool || !user) return;

    setTools(prevTools =>
      prevTools.map(t =>
        t.id === toolId
          ? {
              ...t,
              status: ToolStatus.Borrowed,
              currentUser: userId,
              borrowedAt: new Date().toISOString(),
              estimatedReturnAt: estimatedReturn.toISOString(),
            }
          : t
      )
    );

    const newLoanRecord: LoanRecord = {
      id: `loan-${Date.now()}`,
      toolId,
      userId,
      checkoutDate: new Date().toISOString(),
      shift: getCurrentShift(),
    };
    setLoanRecords(prev => [...prev, newLoanRecord]);
    addNotification(NotificationType.CheckOut, `${tool.name} prestada a ${user.name}.`);
  };

  const checkInTool = (toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;
    const user = getUserById(tool.currentUser!);

    setTools(prevTools =>
      prevTools.map(t =>
        t.id === toolId
          ? {
              ...t,
              status: ToolStatus.Available,
              currentUser: undefined,
              borrowedAt: undefined,
              estimatedReturnAt: undefined,
            }
          : t
      )
    );

    setLoanRecords(prevRecords =>
      prevRecords.map(record =>
        record.toolId === toolId && !record.checkinDate
          ? { ...record, checkinDate: new Date().toISOString() }
          : record
      )
    );
    addNotification(NotificationType.CheckIn, `${tool.name} devuelta por ${user?.name || 'usuario'}.`);
  };
  
  const updateTool = (updatedTool: Tool) => {
    setTools(prevTools =>
      prevTools.map(tool => (tool.id === updatedTool.id ? updatedTool : tool))
    );
  };

  const addTool = (newToolData: Omit<Tool, 'status' | 'id'> & { id?: string }) => {
    const newTool: Tool = {
      ...newToolData,
      id: newToolData.id || `${newToolData.category.slice(0,4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: ToolStatus.Available,
    };
    setTools(prev => [newTool, ...prev]);
  };

  const decommissionTool = (payload: { toolId: string; reason: string; description: string; image?: string; replacementReason: string; }) => {
    const tool = getToolById(payload.toolId);
    if (!tool || !authenticatedUser) return;
    
    setTools(prevTools =>
      prevTools.map(t =>
        t.id === payload.toolId
          ? {
              ...t,
              status: ToolStatus.Decommissioned,
              currentUser: undefined,
              borrowedAt: undefined,
              estimatedReturnAt: undefined,
              location: 'Almacén de Bajas',
            }
          : t
      )
    );

    const newRecord: DecommissionRecord = {
      ...payload,
      date: new Date().toISOString(),
      responsibleUserId: authenticatedUser.id,
      replacementStatus: ReplacementStatus.Generated,
    };
    setDecommissionRecords(prev => [newRecord, ...prev]);
    addNotification(NotificationType.Decommission, `${tool.name} ha sido dada de baja.`);
  };

  const updateReplacementStatus = (toolId: string, status: ReplacementStatus) => {
    setDecommissionRecords(prev =>
        prev.map(r => (r.toolId === toolId ? { ...r, replacementStatus: status } : r))
    );
  };

  const addUser = (user: User) => {
    setUsers(prev => [{...user, id: user.id || `USER-${Date.now()}`}, ...prev]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => (user.id === updatedUser.id ? updatedUser : user)));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  const sendToolToMaintenance = (payload: { toolId: string; company: string; description: string; type: MaintenanceType; }) => {
    const tool = getToolById(payload.toolId);
    if (!tool) return;
    
    setTools(prevTools => prevTools.map(t => t.id === payload.toolId ? { ...t, status: ToolStatus.InMaintenance } : t));
    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      date: new Date().toISOString(),
      ...payload
    };
    setMaintenanceRecords(prev => [newRecord, ...prev]);
    addNotification(NotificationType.Maintenance, `${tool.name} enviada a mantenimiento.`);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  };

  const addLockoutDevice = (deviceData: Omit<LockoutDevice, 'id'>) => {
    const newDevice: LockoutDevice = {
      ...deviceData,
      id: `LOTO-${deviceData.type.charAt(0)}-${Date.now().toString().slice(-3)}`,
    };
    setLockoutDevices(prev => [...prev, newDevice]);
    addNotification(NotificationType.CheckOut, `Dispositivo LOTO ${newDevice.name} agregado.`);
  };

  const updateLockoutDevice = (id: string, updates: Partial<LockoutDevice>) => {
    setLockoutDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteLockoutDevice = (id: string) => {
    const device = lockoutDevices.find(d => d.id === id);
    if (device?.status === LockoutDeviceStatus.InUse) {
      addNotification(NotificationType.Maintenance, `No se puede eliminar ${device.name} porque está en uso.`);
      return;
    }
    setLockoutDevices(prev => prev.filter(d => d.id !== id));
    addNotification(NotificationType.Decommission, `Dispositivo LOTO eliminado.`);
  };

  const addLockoutUsageRecord = (data: Omit<LockoutUsageRecord, 'id' | 'startDate'>) => {
    const device = lockoutDevices.find(d => d.id === data.deviceId);
    if (!device || device.status === LockoutDeviceStatus.InUse) return;

    const newRecord: LockoutUsageRecord = {
      ...data,
      id: `LUR-${Date.now()}`,
      startDate: new Date().toISOString(),
    };
    
    setLockoutUsageRecords(prev => [...prev, newRecord]);
    setLockoutDevices(prev => prev.map(d => 
      d.id === data.deviceId 
        ? { ...d, status: LockoutDeviceStatus.InUse, currentUserId: data.userId }
        : d
    ));
    
    addNotification(NotificationType.CheckOut, `Dispositivo LOTO ${device.name} registrado en uso.`);
  };

  const endLockoutUsage = (recordId: string) => {
    const record = lockoutUsageRecords.find(r => r.id === recordId);
    if (!record || record.endDate) return;
    
    setLockoutUsageRecords(prev => prev.map(r => 
      r.id === recordId ? { ...r, endDate: new Date().toISOString() } : r
    ));
    
    setLockoutDevices(prev => prev.map(d => 
      d.id === record.deviceId 
        ? { ...d, status: LockoutDeviceStatus.Available, currentUserId: undefined }
        : d
    ));
    
    const device = lockoutDevices.find(d => d.id === record.deviceId);
    addNotification(NotificationType.CheckIn, `Dispositivo LOTO ${device?.name} liberado.`);
  };

  return (
    <DataContext.Provider value={{ 
      tools, 
      users, 
      loanRecords, 
      getToolById, 
      getUserById, 
      checkOutTool, 
      checkInTool, 
      updateTool, 
      addTool, 
      decommissionRecords, 
      decommissionTool, 
      updateReplacementStatus, 
      addUser, 
      updateUser, 
      deleteUser, 
      maintenanceRecords, 
      sendToolToMaintenance, 
      settings, 
      updateSettings, 
      notifications, 
      markAllNotificationsAsRead, 
      authenticatedUser, 
      login, 
      logout,
      lockoutDevices,
      lockoutUsageRecords,
      addLockoutDevice,
      updateLockoutDevice,
      deleteLockoutDevice,
      addLockoutUsageRecord,
      endLockoutUsage
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};