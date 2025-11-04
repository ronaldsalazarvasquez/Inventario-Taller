import React from 'react';
import { Notification, NotificationType } from '../types';
// FIX: Import BellIcon to use as a fallback icon.
import { ArrowUturnLeftIcon, BellAlertIcon, CheckBadgeIcon, Cog6ToothIcon, TrashIcon, BellIcon } from './common/Icon';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

const NOTIFICATION_ICONS: { [key in NotificationType]: { icon: React.ElementType, color: string } } = {
    [NotificationType.CheckOut]: { icon: CheckBadgeIcon, color: 'text-brand-secondary' },
    [NotificationType.CheckIn]: { icon: ArrowUturnLeftIcon, color: 'text-blue-500' },
    [NotificationType.Overdue]: { icon: BellAlertIcon, color: 'text-red-500' },
    [NotificationType.Maintenance]: { icon: Cog6ToothIcon, color: 'text-indigo-500' },
    [NotificationType.Decommission]: { icon: TrashIcon, color: 'text-gray-500' },
};

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) {
      return `hace ${Math.floor(interval)} años`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return `hace ${Math.floor(interval)} meses`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return `hace ${Math.floor(interval)} días`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return `hace ${Math.floor(interval)} horas`;
    }
    interval = seconds / 60;
    if (interval > 1) {
      return `hace ${Math.floor(interval)} minutos`;
    }
    return "justo ahora";
};


export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onMarkAllAsRead }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="text-lg font-semibold">Notificaciones</h3>
                <button onClick={onMarkAllAsRead} className="text-sm text-brand-primary hover:underline">Marcar como leídas</button>
            </div>
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {notifications.length > 0 ? notifications.map(notif => {
                    const { icon: Icon, color } = NOTIFICATION_ICONS[notif.type] || { icon: BellIcon, color: 'text-gray-500' };
                    return (
                        <li key={notif.id} className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 ${color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-brand-text-primary">{notif.message}</p>
                                    <p className="text-xs text-brand-text-secondary mt-1">{timeSince(notif.timestamp)}</p>
                                </div>
                            </div>
                        </li>
                    );
                }) : (
                    <li className="p-6 text-center text-sm text-gray-500">No tienes notificaciones nuevas.</li>
                )}
            </ul>
        </div>
    );
};