// Sidebar.tsx
import React from 'react';
import { DashboardIcon, WrenchScrewdriverIcon, ArrowRightLeftIcon, ChartBarIcon, CogIcon, LogoutIcon, ShieldCheckIcon } from './common/Icon';
import { useData } from '../context/DataContext';

type View = 'dashboard' | 'tools' | 'checkinout' | 'reports' | 'settings' | 'profile' | 'loto';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}> = ({ icon: Icon, label, isActive, onClick, isCollapsed }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 overflow-hidden ${
      isActive ? 'text-white shadow-lg' : 'text-gray-700 hover:text-gray-900'
    } ${isCollapsed ? 'justify-center' : ''}`}
    title={isCollapsed ? label : ''}
  >
    {isActive && (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </>
    )}
    {!isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
    )}

    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
      isActive 
        ? 'bg-white/25 shadow-lg backdrop-blur-sm' 
        : 'bg-gradient-to-br from-rose-100 to-amber-100 group-hover:bg-white group-hover:scale-110 group-hover:shadow-md'
    } ${isCollapsed ? 'flex-shrink-0' : ''}`}>
      <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-orange-600'}`} />
    </div>

    {!isCollapsed && <span className="relative z-10 ml-3 truncate">{label}</span>}

    {isActive && !isCollapsed && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-l-full shadow-lg"></div>
    )}

    {isActive && isCollapsed && (
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
    )}

    {isCollapsed && (
      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[70] shadow-2xl border border-gray-700">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
      </div>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { logout } = useData();

  const navItems = [
    { id: 'dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { id: 'tools', icon: WrenchScrewdriverIcon, label: 'Herramientas' },
    { id: 'loto', icon: ShieldCheckIcon, label: 'LOTOTO' },
    { id: 'checkinout', icon: ArrowRightLeftIcon, label: 'Préstamo/Devolución' },
    { id: 'reports', icon: ChartBarIcon, label: 'Reportes' },
    { id: 'settings', icon: CogIcon, label: 'Configuración' },
  ] as const;

  const handleSetView = (view: View) => {
    setView(view);
    setIsOpen(false);
  };

  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-[100] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar fijo - redondeado en móvil, cuadrado en desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 ${sidebarWidthClass} z-[110] bg-white transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-all duration-300 ease-in-out
        md:translate-x-0 md:z-40
        rounded-r-3xl md:rounded-none
        shadow-2xl
      `}
      >
        {/* Layout interno: columna con altura de pantalla */}
        <div className="h-full flex flex-col rounded-r-3xl md:rounded-none overflow-hidden">
          {/* Header del sidebar */}
          <div className={`relative h-16 flex items-center bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border-b border-gray-200 ${isCollapsed ? 'justify-center px-2' : 'justify-center px-6'} rounded-tr-3xl md:rounded-none`}>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 via-orange-100/30 to-amber-100/30 animate-gradient-x opacity-50"></div>
            <div className={`relative flex items-center group cursor-pointer ${isCollapsed ? 'flex-col' : ''}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 p-2.5 rounded-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <WrenchScrewdriverIcon className={`${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'} text-white`} />
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <h1 className="text-xl font-black bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                    ToolTrack
                  </h1>
                  <p className="text-[11px] font-semibold text-gray-500 tracking-wide">Sistema de Gestión</p>
                </div>
              )}
            </div>

            {/* Botón cerrar (solo móvil) */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden p-2 rounded-2xl bg-white hover:bg-gray-100 transition-colors duration-200 shadow-md z-10"
              aria-label="Cerrar menú lateral"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Botón colapsar (solo desktop) */}
          <div className={`hidden md:flex items-center bg-gradient-to-r from-gray-50 to-orange-50/30 border-b border-gray-200 ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-end px-4 py-2.5'}`}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="group p-2 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-rose-400 hover:via-orange-400 hover:to-amber-400 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-transparent"
              title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              <svg 
                className={`w-5 h-5 text-gray-600 group-hover:text-white transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navegación scrollable */}
          <nav className="flex-1 min-h-0 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar bg-white">
            {!isCollapsed && (
              <div className="px-4 mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full mr-2"></span>
                  Menú Principal
                </p>
              </div>
            )}

            {navItems.map((item, index) => (
              <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  isActive={currentView === item.id}
                  onClick={() => handleSetView(item.id as View)}
                  isCollapsed={isCollapsed}
                />
              </div>
            ))}
          </nav>

          {/* Footer fijo al fondo */}
          <div className={`shrink-0 px-3 py-3 border-t border-gray-200 bg-white ${isCollapsed ? 'px-2' : ''} rounded-br-3xl md:rounded-none`}>
            <button
              onClick={logout}
              className={`group relative flex items-center w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 overflow-hidden text-rose-600 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? 'Cerrar Sesión' : ''}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-50 group-hover:bg-white/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <LogoutIcon className="w-5 h-5 text-rose-500 group-hover:text-white transition-colors duration-300" />
              </div>
              {!isCollapsed && (
                <>
                  <span className="relative z-10 ml-3 truncate">Cerrar Sesión</span>
                  <svg className="relative z-10 w-4 h-4 ml-auto transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[70] shadow-2xl border border-gray-700">
                  Cerrar Sesión
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          @keyframes fade-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
          .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #fb7185, #fb923c, #fbbf24); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #f43f5e, #f97316, #f59e0b); }
        `}</style>
      </aside>
    </>
  );
};