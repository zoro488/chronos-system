/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS MAIN LAYOUT - ULTRA PREMIUM                    ║
 * ║   Layout Maestro que integra Header + Sidebar + Content Area             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - ✨ Integración completa Header + Sidebar
 * - 📱 Responsive total (Mobile, Tablet, Desktop)
 * - 🎨 Animaciones de transición entre páginas
 * - 💾 Persistencia de estado (sidebar collapsed)
 * - ⌨️ Keyboard shortcuts globales
 * - 🎭 Soporte Dark/Light mode
 */
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import UltraHeaderComplete from './UltraHeaderComplete';
import UltraSidebarComplete from './UltraSidebarComplete';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Persistir estado del sidebar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chronos-sidebar-collapsed');
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('chronos-sidebar-collapsed', String(newState));
  };

  const toggleSidebarMobile = () => {
    setSidebarMobileOpen(!sidebarMobileOpen);
  };

  // Cerrar sidebar móvil en cambio de ruta
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [location.pathname]);

  // Variantes de animación para el content area
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* SIDEBAR - Desktop */}
      <UltraSidebarComplete
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={() => setSidebarMobileOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <UltraHeaderComplete
          onMenuToggle={toggleSidebarMobile}
          onActionClick={(actionId, item) => {
            console.log('Action clicked:', actionId, item);
            // Aquí manejarías las acciones (abrir modales, etc.)
          }}
        />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              {/* Contenedor con padding responsive */}
              <div className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* OVERLAY para Sidebar Móvil */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
