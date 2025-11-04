import React, { useState, FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { WrenchScrewdriverIcon } from './common/Icon';

export const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState({ userId: false, password: false });
  const { login } = useData();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(userId, password);
    if (!success) {
      setError('ID de usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      
      {/* LEFT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-white via-rose-50/30 to-orange-50/40 flex items-center justify-center overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-rose-300/25 via-orange-300/25 to-amber-300/25 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-amber-300/25 via-orange-300/25 to-rose-300/25 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-orange-300/20 to-rose-300/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>

          {/* Floating Geometric Shapes - Hidden on mobile */}
          <div className="hidden md:block absolute top-20 left-20 w-16 h-16 border-2 border-rose-400/15 rounded-xl rotate-45 animate-float-slow"></div>
          <div className="hidden md:block absolute bottom-32 left-40 w-12 h-12 border-2 border-orange-400/15 rounded-full animate-float-slower"></div>
          <div className="hidden md:block absolute top-40 right-32 w-20 h-20 border-2 border-amber-300/15 rotate-12 animate-spin-very-slow"></div>
        </div>

        {/* Form Content */}
        <div className="relative z-10 w-full max-w-md px-6 sm:px-8 md:px-10 py-8 animate-slide-in-left">
          
          {/* Logo Section */}
          <div className="mb-8 md:mb-12 animate-fade-in">
            <div className="flex items-center mb-3 group cursor-pointer">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse-glow"></div>
                
                {/* Icon Container */}
                <div className="relative bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 p-3 md:p-4 rounded-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                  <WrenchScrewdriverIcon className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg"/>
                </div>
              </div>
              
              <div className="ml-4 md:ml-5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                  ToolTrack
                </h1>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 transition-all duration-500 rounded-full mt-1"></div>
              </div>
            </div>
            
            <div className="ml-1 space-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Bienvenido
              </h2>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                Gestiona tus herramientas de forma inteligente
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            
            {/* User ID Input */}
            <div className="space-y-2 animate-fade-in animation-delay-200">
              <label htmlFor="userId" className="flex items-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ID de Usuario
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 rounded-xl md:rounded-2xl transition-all duration-300 ${isFocused.userId ? 'opacity-100 blur-md' : 'opacity-0'}`}></div>
                <input 
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, userId: true})}
                  onBlur={() => setIsFocused({...isFocused, userId: false})}
                  autoFocus
                  required
                  className="relative w-full px-4 md:px-5 py-3 md:py-4 bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all duration-300 hover:border-orange-300 hover:shadow-lg font-medium text-base md:text-lg"
                  placeholder="USER-XXX"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-300 ${userId ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 animate-fade-in animation-delay-400">
              <label htmlFor="password" className="flex items-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">
                <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña
              </label>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 rounded-xl md:rounded-2xl transition-all duration-300 ${isFocused.password ? 'opacity-100 blur-md' : 'opacity-0'}`}></div>
                <input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, password: true})}
                  onBlur={() => setIsFocused({...isFocused, password: false})}
                  required
                  className="relative w-full px-4 md:px-5 py-3 md:py-4 bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all duration-300 hover:border-orange-300 hover:shadow-lg font-medium text-base md:text-lg"
                  placeholder="••••••••"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-300 ${password ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl md:rounded-2xl p-3 md:p-4 animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs sm:text-sm text-red-600 font-semibold">{error}</p>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button 
              type="submit"
              className="relative w-full group overflow-hidden rounded-xl md:rounded-2xl animate-fade-in animation-delay-600"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
              
              <div className="relative flex justify-center items-center py-3 md:py-4 px-6 text-base md:text-lg font-bold text-white transform group-hover:scale-[1.02] transition-all duration-300 shadow-xl">
                <span className="mr-2">Ingresar al Sistema</span>
                <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            {/* Additional Info */}
            <div className="text-center pt-2 md:pt-4 animate-fade-in animation-delay-800">
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
                <svg className="w-4 h-4 text-emerald-500 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Conexión segura y encriptada</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - Image Panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1581092916375-2a227cf74b59?q=80&w=1887&auto=format&fit=crop')"
          }}
        ></div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-rose-900/40 to-orange-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-orange-600/30 via-transparent to-rose-600/30 animate-gradient-shift"></div>

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.3) 2px, transparent 2px)`,
          backgroundSize: '100px 100px',
          animation: 'grid-move 20s linear infinite'
        }}></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-12 xl:p-16">
          
          {/* Main Icon */}
          <div className="mb-10 xl:mb-12 animate-float">
            <div className="relative">
              {/* Rotating Ring */}
              <div className="absolute inset-0 -m-8">
                <div className="w-full h-full border-4 border-white/15 rounded-full animate-spin-slow"></div>
              </div>
              <div className="absolute inset-0 -m-12">
                <div className="w-full h-full border-2 border-amber-400/20 rounded-full animate-spin-reverse"></div>
              </div>
              
              {/* Icon */}
              <div className="relative bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 p-8 xl:p-10 rounded-3xl shadow-2xl backdrop-blur-sm border-4 border-white/20">
                <WrenchScrewdriverIcon className="w-20 h-20 xl:w-24 xl:h-24 text-white drop-shadow-2xl"/>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-5 xl:space-y-6 max-w-xl animate-slide-in-right">
            <h3 className="text-4xl xl:text-6xl font-black drop-shadow-2xl leading-tight">
              Control Total
            </h3>
            <p className="text-lg xl:text-2xl text-white/90 font-medium drop-shadow-lg leading-relaxed">
              Administra, rastrea y optimiza todas tus herramientas desde una plataforma moderna y potente
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-3 xl:gap-4 pt-6 xl:pt-8">
              {[
                { icon: '🔒', text: 'Seguro', delay: '0ms' },
                { icon: '⚡', text: 'Rápido', delay: '200ms' },
                { icon: '🎯', text: 'Preciso', delay: '400ms' }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-xl xl:rounded-2xl p-4 xl:p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:-translate-y-2 cursor-pointer animate-fade-in-up shadow-xl"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="text-3xl xl:text-4xl mb-2">{feature.icon}</div>
                  <div className="text-xs xl:text-sm font-bold uppercase tracking-wider">{feature.text}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-6 xl:space-x-8 pt-6 xl:pt-8 animate-fade-in animation-delay-600">
              {[
                { number: '99.9%', label: 'Uptime' },
                { number: '24/7', label: 'Soporte' },
                { number: '1000+', label: 'Usuarios' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl xl:text-3xl font-black bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-xs xl:text-sm text-white/70 font-semibold uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-20 h-20 xl:w-24 xl:h-24 border-4 border-white/15 rounded-2xl rotate-12 animate-float-slow"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 xl:w-20 xl:h-20 border-4 border-amber-400/20 rounded-full animate-pulse-slow"></div>
          <div className="absolute top-1/3 left-10 w-14 h-14 xl:w-16 xl:h-16 bg-gradient-to-br from-rose-400/15 to-amber-400/15 rounded-lg rotate-45 animate-spin-very-slow backdrop-blur-sm"></div>
        </div>

        {/* Particle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-40px) translateX(-15px) scale(1.1); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(2deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 8s ease-in-out infinite; }
        .animate-ken-burns { animation: ken-burns 30s ease-out infinite alternate; }
        .animate-gradient-shift { animation: gradient-shift 5s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-very-slow { animation: spin-very-slow 15s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; opacity: 0; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out forwards; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};