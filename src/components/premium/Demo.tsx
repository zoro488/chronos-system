/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                DEMO: Premium Components Usage Examples                    ║
 * ║  Ejemplos de uso de todos los componentes premium                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { Button, Card, Input, Modal, ToastProvider, useToast } from './index';

// ============================================================================
// DEMO COMPONENT
// ============================================================================

function PremiumComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const { showToast } = useToast();

  const handleButtonClick = () => {
    showToast('¡Botón clickeado!', 'success');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setInputError('Debe tener al menos 3 caracteres');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Premium Components Demo
          </h1>
          <p className="text-gray-300">Sistema de componentes UI/UX con animaciones premium</p>
        </div>

        {/* Buttons Demo */}
        <Card glass={true} className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm" onClick={handleButtonClick}>
              Primary Small
            </Button>
            <Button variant="secondary" size="md" onClick={handleButtonClick}>
              Secondary Medium
            </Button>
            <Button variant="ghost" size="lg" onClick={handleButtonClick}>
              Ghost Large
            </Button>
            <Button variant="danger" onClick={handleButtonClick}>
              Danger
            </Button>
            <Button variant="primary" isLoading>
              Loading...
            </Button>
          </div>
        </Card>

        {/* Cards Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass={false} hover={true} className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Card Normal</h3>
            <p className="text-gray-300">
              Esta es una tarjeta estándar con hover effect
            </p>
          </Card>

          <Card glass={true} hover={true} className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Card Glassmorphism</h3>
            <p className="text-gray-300">
              Esta tarjeta usa el efecto de cristal esmerilado
            </p>
          </Card>
        </div>

        {/* Inputs Demo */}
        <Card glass={true} className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Inputs</h2>
          <div className="space-y-4">
            <Input
              label="Nombre"
              placeholder="Ingresa tu nombre"
              value={inputValue}
              onChange={handleInputChange}
              error={inputError}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </Card>

        {/* Modal Demo */}
        <Card glass={true} className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Modal</h2>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Abrir Modal
          </Button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Demo Modal"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Este es un modal premium con animaciones suaves y backdrop blur.
              </p>
              <Input
                label="Campo de ejemplo"
                placeholder="Escribe algo..."
              />
              <div className="flex gap-4 justify-end">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    showToast('Modal guardado!', 'success');
                    setModalOpen(false);
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </Modal>
        </Card>

        {/* Toast Demo */}
        <Card glass={true} className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Toast Notifications</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              onClick={() => showToast('Operación exitosa!', 'success')}
            >
              Success Toast
            </Button>
            <Button 
              variant="danger" 
              onClick={() => showToast('Error al procesar', 'error')}
            >
              Error Toast
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => showToast('Advertencia importante', 'warning')}
            >
              Warning Toast
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => showToast('Información útil', 'info')}
            >
              Info Toast
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

// ============================================================================
// APP WRAPPER WITH TOAST PROVIDER
// ============================================================================

export default function PremiumComponentsDemoApp() {
  return (
    <ToastProvider>
      <PremiumComponentsDemo />
    </ToastProvider>
  );
}
