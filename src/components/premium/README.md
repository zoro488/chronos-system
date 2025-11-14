# 🎨 Premium UI Components

Sistema completo de componentes modernos con animaciones premium para CHRONOS System.

## 📦 Componentes

### 1. Button Premium
Botón con variantes y animaciones suaves.

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost' | 'danger'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `isLoading`: `boolean` - Muestra spinner de carga
- `icon`: `ReactNode` - Icono opcional

**Ejemplo:**
```tsx
import { Button } from '@/components/premium';

<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

### 2. Card Premium
Tarjeta con efectos glassmorphism y animaciones hover.

**Props:**
- `glass`: `boolean` - Activa efecto glassmorphism
- `hover`: `boolean` - Activa animaciones hover (default: `true`)
- `className`: `string` - Clases CSS adicionales

**Ejemplo:**
```tsx
import { Card } from '@/components/premium';

<Card glass={true} hover={true}>
  <p>Contenido de la tarjeta</p>
</Card>
```

### 3. Input Premium
Input con microanimaciones y estados de error.

**Props:**
- `label`: `string` - Etiqueta del input
- `error`: `string` - Mensaje de error
- `icon`: `ReactNode` - Icono opcional
- Todos los props estándar de `<input>`

**Ejemplo:**
```tsx
import { Input } from '@/components/premium';

<Input 
  label="Email" 
  error="Email inválido"
  placeholder="tu@email.com"
/>
```

### 4. Modal Premium
Modal con animaciones y backdrop blur.

**Props:**
- `isOpen`: `boolean` - Estado de apertura
- `onClose`: `() => void` - Callback al cerrar
- `title`: `string` - Título opcional
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)

**Ejemplo:**
```tsx
import { Modal } from '@/components/premium';

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Mi Modal"
  size="md"
>
  <p>Contenido del modal</p>
</Modal>
```

### 5. Toast Premium
Sistema de notificaciones con contexto.

**Uso:**
```tsx
import { ToastProvider, useToast } from '@/components/premium';

// En tu App root:
<ToastProvider>
  <App />
</ToastProvider>

// En cualquier componente:
const { showToast } = useToast();

showToast('Operación exitosa!', 'success');
showToast('Error al guardar', 'error');
showToast('Advertencia importante', 'warning');
showToast('Información útil', 'info');
```

## ✨ Características

- ✅ **Animaciones Framer Motion**: Transiciones suaves y profesionales
- ✅ **Microinteracciones**: Feedback visual en cada acción
- ✅ **Glassmorphism**: Efectos modernos de cristal esmerilado
- ✅ **Dark Mode**: Compatible con tema oscuro
- ✅ **TypeScript**: Tipado completo y seguro
- ✅ **Responsive**: Adaptable a todos los tamaños de pantalla
- ✅ **Accesibilidad**: Componentes accesibles

## 🎯 Casos de Uso

### Formulario Completo
```tsx
import { Button, Input, Card, useToast } from '@/components/premium';

function MyForm() {
  const { showToast } = useToast();
  
  const handleSubmit = () => {
    showToast('Formulario enviado!', 'success');
  };
  
  return (
    <Card glass={true}>
      <Input label="Nombre" placeholder="Tu nombre" />
      <Input label="Email" placeholder="tu@email.com" />
      <Button variant="primary" onClick={handleSubmit}>
        Enviar
      </Button>
    </Card>
  );
}
```

### Modal con Formulario
```tsx
import { Modal, Button, Input } from '@/components/premium';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Nuevo Usuario"
      >
        <Input label="Nombre" />
        <Input label="Email" />
        <Button variant="primary">Guardar</Button>
      </Modal>
    </>
  );
}
```

## 🎨 Personalización

Todos los componentes utilizan Tailwind CSS y pueden ser personalizados mediante la prop `className`:

```tsx
<Button className="my-4 mx-auto">
  Custom Button
</Button>

<Card className="p-8 max-w-lg">
  Custom Card
</Card>
```

## 📚 Dependencias

- `framer-motion`: Animaciones
- `react`: Framework principal
- `react-dom`: Portal para Modal
- `tailwindcss`: Estilos

---

**🌌 CHRONOS SYSTEM - Premium UI Components**
