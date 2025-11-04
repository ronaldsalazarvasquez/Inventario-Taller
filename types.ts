
export enum ToolStatus {
  Available = 'Disponible',
  Borrowed = 'En Préstamo',
  InMaintenance = 'En Mantenimiento',
  Decommissioned = 'Dada de Baja',
}

export enum ToolCategory {
  Electric = 'Eléctrica',
  Mechanic = 'Mecánica',
}

export enum Shift {
    T1 = 'T1 (08:00-16:00)',
    T2 = 'T2 (16:00-00:00)',
    T3 = 'T3 (00:00-08:00)',
}

export enum ReplacementStatus {
    Generated = 'Solicitud Generada',
    Seen = 'Solicitud Vista',
    InProgress = 'En Proceso de Compra',
    Delivered = 'Entregado',
    Received = 'Herramienta Recibida'
}

export enum UserRole {
    Administrator = 'Administrator',
    Supervisor = 'Supervisor',
    Mechanic = 'Técnico Mecánico',
    Electric = 'Técnico Eléctrico',
    Operator = 'Operator',
}

export enum MaintenanceType {
    Preventive = 'Preventivo',
    Corrective = 'Correctivo',
}

export enum NotificationType {
    CheckOut = 'Préstamo',
    CheckIn = 'Devolución',
    Overdue = 'Vencido',
    Maintenance = 'Mantenimiento',
    Decommission = 'Baja',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  brand: string;
  status: ToolStatus;
  location: string;
  acquisitionDate: string;
  lifespan: number; // in months
  observations: string;
  currentUser?: string; // User ID
  borrowedAt?: string;
  estimatedReturnAt?: string;
  imageUrl?: string;
  procedureUrl?: string;
  isMeasuringInstrument?: boolean;
  hasCertification?: boolean;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  calibrationCertificateType?: 'file' | 'url';
  calibrationCertificateValue?: string; // base64 encoded pdf or url
}

export interface User {
  id: string; // Corresponds to QR, Barcode or RFID tag
  name: string;
  role: UserRole;
  avatarUrl?: string;
  accessZones?: string[];
  password?: string;
}

export interface LoanRecord {
  id: string;
  toolId: string;
  userId: string;
  checkoutDate: string;
  checkinDate?: string;
  shift: Shift;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  toolId: string;
  date: string;
  description: string;
  type: MaintenanceType;
  company: string;
}

export interface DecommissionRecord {
  toolId: string;
  date: string;
  reason: string;
  description: string;
  image?: string; // base64 encoded image
  responsibleUserId: string;
  replacementReason: string;
  replacementStatus: ReplacementStatus;
}
