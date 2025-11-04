import React, { useState } from 'react';
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from './common/Icon';
import { useData } from '../context/DataContext';
import { NotificationsPanel } from './NotificationsPanel';

type View = 'dashboard' | 'tools' | 'checkinout' | 'reports' | 'settings' | 'profile';

interface HeaderProps {
  onMenuClick: () => void;
  setView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, setView }) => {
  const { authenticatedUser, notifications, markAllNotificationsAsRead } = useData();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };
  
  const handleMarkAsRead = () => {
    markAllNotificationsAsRead();
  };

  return (
    <header
      className="
        flex items-center justify-between
        h-12 sm:h-14 md:h-16
        px-2 sm:px-3 md:px-4
        bg-brand-surface border-b border-gray-200
      "
    >
      <div className="flex items-center">
        {/* Botón menú más compacto, con área táctil accesible */}
        <button
          onClick={onMenuClick}
          className="
            md:hidden mr-2 sm:mr-3
            text-gray-600 hover:text-gray-800
            rounded-md
            p-1.5
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary
          "
          aria-label="Abrir menú de navegación"
        >
          <MenuIcon className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Notificaciones más compactas */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="
              relative
              p-1.5 sm:p-2
              text-gray-600 hover:text-gray-800
              rounded-full hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary
            "
            aria-label="Notificaciones"
          >
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse-fast"></span>
              </>
            )}
            <BellIcon className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>
          {isNotificationsOpen && (
            <NotificationsPanel
              notifications={notifications}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkAllAsRead={handleMarkAsRead}
            />
          )}
        </div>

        {/* Perfil compacto en móvil, con texto oculto en xs */}
        <button
          onClick={() => setView('profile')}
          className="
            flex items-center
            p-1 sm:p-1.5
            rounded-md hover:bg-gray-100 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary
          "
          aria-label="Abrir perfil"
        >
          <img
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover"
            src={authenticatedUser?.avatarUrl || 'https://picsum.photos/100'}
            alt="Avatar de usuario"
          />
          <div className="hidden sm:block ml-2 md:ml-3 text-left">
            <p className="text-xs md:text-sm font-medium text-brand-text-primary">
              {authenticatedUser?.name}
            </p>
            <p className="text-[11px] md:text-xs text-brand-text-secondary">
              {authenticatedUser?.role}
            </p>
          </div>
          <ChevronDownIcon className="hidden sm:block w-4 h-4 md:w-5 md:h-5 ml-1 text-gray-400" />
        </button>
      </div>
    </header>
  );
};