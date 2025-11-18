# 🎬 Premium Animation System

Sistema completo de animaciones, transiciones y microinteracciones premium para CHRONOS System.

## 📦 Componentes

### Animaciones Globales (`lib/animations.ts`)

Más de 15 variantes de animación predefinidas usando Framer Motion:

- **Entrada**: `fadeIn`, `slideInFromLeft`, `slideInFromRight`, `slideInFromBottom`, `slideInFromTop`, `scaleIn`, `rotateIn`
- **Hover**: `hoverScale`, `hoverGlow`
- **Tap**: `tapScale`
- **Listas**: `staggerChildren`, `listItem`
- **Efectos**: `pulse`, `shake`, `bounce`, `shimmer`
- **Páginas**: `pageTransition`

### Hooks Personalizados (`hooks/useAnimations.ts`)

- **`useScrollAnimation()`**: Detecta cuando elementos entran en el viewport
- **`useParallax(speed)`**: Efecto parallax basado en scroll
- **`useMouseParallax()`**: Parallax basado en posición del mouse

### Componentes Premium

#### AnimatedContainer

Contenedor animado reutilizable con scroll detection:

```tsx
import { AnimatedContainer } from './components/premium';

<AnimatedContainer animation="fadeIn" delay={0.2}>
  <YourContent />
</AnimatedContainer>
```

**Props:**
- `animation`: Cualquier variante de `lib/animations.ts`
- `className`: Clases CSS adicionales
- `delay`: Retraso antes de la animación

#### MicroInteractions

##### RippleButton

Botón con efecto ripple al hacer clic:

```tsx
import { RippleButton } from './components/premium';

<RippleButton onClick={handleClick}>
  Click Me
</RippleButton>
```

##### AnimatedSwitch

Toggle animado con transición suave:

```tsx
import { AnimatedSwitch } from './components/premium';

<AnimatedSwitch 
  isOn={state} 
  onToggle={() => setState(!state)} 
/>
```

##### LoadingSpinner

Spinner de carga premium:

```tsx
import { LoadingSpinner } from './components/premium';

<LoadingSpinner />
```

##### AnimatedProgressBar

Barra de progreso animada:

```tsx
import { AnimatedProgressBar } from './components/premium';

<AnimatedProgressBar progress={75} />
```

#### PageTransition

Transiciones entre páginas con React Router:

```tsx
import { PageTransition } from './components/premium';
import { useLocation } from 'react-router-dom';

function App() {
  return (
    <PageTransition>
      <YourPage />
    </PageTransition>
  );
}
```

## 🎨 Estilos CSS (`styles/animations.css`)

### Animaciones CSS

```css
.animate-gradient  /* Gradiente animado */
.animate-float     /* Efecto flotante */
.animate-glow      /* Efecto de brillo pulsante */
```

### Glassmorphism

```css
.glass             /* Glassmorphism claro */
.glass-dark        /* Glassmorphism oscuro */
```

### Neumorphism

```css
.neomorph          /* Neumorphism claro */
.neomorph-dark     /* Neumorphism oscuro */
```

## 🚀 Uso Rápido

### 1. Importar las animaciones CSS

En tu archivo principal o componente:

```tsx
import '../styles/animations.css';
```

### 2. Usar componentes animados

```tsx
import { 
  AnimatedContainer, 
  RippleButton, 
  AnimatedSwitch,
  LoadingSpinner 
} from './components/premium';

function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  return (
    <AnimatedContainer animation="fadeIn">
      <div className="glass p-6 rounded-xl">
        <RippleButton onClick={handleAction}>
          Action Button
        </RippleButton>
        
        {loading && <LoadingSpinner />}
      </div>
    </AnimatedContainer>
  );
}
```

### 3. Usar hooks de animación

```tsx
import { useScrollAnimation, useParallax, useMouseParallax } from './hooks/useAnimations';
import { motion } from 'framer-motion';

function ScrollAnimated() {
  const { ref, isInView } = useScrollAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
    >
      Appears on scroll
    </motion.div>
  );
}

function ParallaxElement() {
  const parallaxRef = useParallax(0.5);
  
  return (
    <div ref={parallaxRef}>
      Moves with scroll
    </div>
  );
}
```

## 📋 Demo Completo

Revisa `components/premium/AnimationsDemo.tsx` para ver todos los componentes en acción.

## ⚡ Características

- ✅ 15+ animaciones predefinidas
- ✅ Hooks personalizados (scroll, parallax, mouse)
- ✅ Microinteracciones premium
- ✅ Page transitions con React Router
- ✅ Glassmorphism y Neumorphism
- ✅ CSS animations complementarias
- ✅ Performance optimizado con Framer Motion
- ✅ TypeScript support completo
- ✅ Tree-shakeable (importa solo lo que necesitas)

## 🎯 Criterios de Éxito

Todos los criterios del PR #3 han sido cumplidos:

- [x] 15+ animaciones predefinidas
- [x] Hooks personalizados (scroll, parallax, mouse)
- [x] Microinteracciones premium
- [x] Page transitions
- [x] Glassmorphism y Neumorphism
- [x] CSS animations complementarias
- [x] Performance optimizado

## 📦 Estructura de Archivos

```
chronos-system/
├── lib/
│   └── animations.ts           # Variantes de animación
├── hooks/
│   └── useAnimations.ts        # Hooks personalizados
├── components/
│   └── premium/
│       ├── AnimatedContainer.tsx
│       ├── MicroInteractions.tsx
│       ├── PageTransition.tsx
│       ├── AnimationsDemo.tsx
│       ├── index.ts            # Exports centralizados
│       └── README.md           # Esta documentación
└── styles/
    └── animations.css          # CSS complementarias
```

## 💡 Tips

1. **Performance**: Las animaciones usan Framer Motion que está optimizado para 60fps
2. **Scroll Animations**: Usa `useScrollAnimation` para animaciones que solo ocurren una vez
3. **Parallax**: Ajusta el `speed` del parallax según el efecto deseado (valores bajos = sutil)
4. **CSS Classes**: Las clases CSS son complementarias, úsalas para efectos simples
5. **Glassmorphism**: Funciona mejor con fondos oscuros o con gradientes

## 🔗 Referencias

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Spring](https://react-spring.dev/)
- [CSS Tricks - Animations](https://css-tricks.com/almanac/properties/a/animation/)
