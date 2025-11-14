/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 PREMIUM COMPONENTS - INTEGRATION GUIDE                    ║
 * ║  Patrones de integración y ejemplos de uso real                          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { Button, Card, Input, Modal, useToast } from './index';

// ============================================================================
// EXAMPLE 1: Form with Validation
// ============================================================================

export function LoginFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email es requerido');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailError || !email || !password) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showToast('¡Inicio de sesión exitoso!', 'success');
    }, 2000);
  };

  return (
    <Card glass={true} className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          error={emailError}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          isLoading={isLoading}
          type="submit"
        >
          {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
        </Button>
      </form>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 2: Confirmation Modal Pattern
// ============================================================================

export function DeleteConfirmationExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      setIsOpen(false);
      showToast('Elemento eliminado exitosamente', 'success');
    }, 1500);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Eliminar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar este elemento? 
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-end">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// EXAMPLE 3: Multi-Step Form in Modal
// ============================================================================

export function MultiStepModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { showToast } = useToast();

  const handleNext = () => {
    if (step === 1 && !formData.name) {
      showToast('Por favor ingresa tu nombre', 'warning');
      return;
    }
    if (step === 2 && !formData.email) {
      showToast('Por favor ingresa tu email', 'warning');
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      showToast('Registro completado!', 'success');
      setIsOpen(false);
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Registrarse
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setStep(1);
        }}
        title={`Registro - Paso ${step} de 3`}
        size="md"
      >
        <div className="space-y-6">
          {step === 1 && (
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          )}
          
          {step === 2 && (
            <Input
              label="Email"
              type="email"
              placeholder="juan@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          )}
          
          {step === 3 && (
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          )}

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4 justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={step === 1}
            >
              Atrás
            </Button>
            <Button 
              variant="primary" 
              onClick={handleNext}
            >
              {step === 3 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// EXAMPLE 4: Dashboard Card with Actions
// ============================================================================

export function DashboardCardExample() {
  const { showToast } = useToast();

  return (
    <Card glass={true} hover={true} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Ventas del Mes</h3>
          <p className="text-gray-400 text-sm">Noviembre 2024</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => showToast('Actualizando datos...', 'info')}
        >
          🔄
        </Button>
      </div>
      
      <div className="mb-6">
        <p className="text-4xl font-bold text-white">$45,231</p>
        <p className="text-green-400 text-sm">↑ 12% vs mes anterior</p>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => showToast('Ver detalles', 'info')}
        >
          Ver Detalles
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => showToast('Exportando...', 'info')}
        >
          Exportar
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 5: Settings Panel
// ============================================================================

export function SettingsPanelExample() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: false
  });
  const { showToast } = useToast();

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(`${key} ${!settings[key] ? 'activado' : 'desactivado'}`, 'success');
  };

  return (
    <Card glass={true} className="p-6 max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Configuración</h2>
      
      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <span className="text-white capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <Button
              variant={value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleToggle(key as keyof typeof settings)}
            >
              {value ? 'ON' : 'OFF'}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button 
          variant="primary" 
          className="w-full"
          onClick={() => showToast('Configuración guardada', 'success')}
        >
          Guardar Cambios
        </Button>
      </div>
    </Card>
  );
}
