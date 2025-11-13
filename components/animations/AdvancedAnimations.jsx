/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   CHRONOS ADVANCED ANIMATIONS                              ║
 * ║          Animaciones 3D y Complejas con Framer Motion                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Colección de animaciones avanzadas:
 * - 3D transforms
 * - Parallax effects
 * - Morphing animations
 * - Complex interactions
 *
 * @module AdvancedAnimations
 * @author CHRONOS System
 * @version 1.0.0
 */
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// 3D CARD - Rotación 3D en hover
// ============================================================================

export const Card3D = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        z: 50,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </motion.div>
  );
};

Card3D.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// PARALLAX CONTAINER - Efecto parallax
// ============================================================================

export const ParallaxContainer = ({ children, speed = 0.5, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      whileInView={{ y: -100 * speed }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

ParallaxContainer.propTypes = {
  children: PropTypes.node.isRequired,
  speed: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// MAGNETIC BUTTON - Botón con efecto magnético
// ============================================================================

export const MagneticButton = ({ children, className = '', onClick }) => {
  return (
    <motion.button
      className={className}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

MagneticButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// ============================================================================
// REVEAL TEXT - Animación de texto revelado
// ============================================================================

export const RevealText = ({ text, delay = 0, className = '' }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  const chars = text.split('').map((char, idx) => ({
    char,
    id: `char-${char.charCodeAt(0)}-${idx}-${Math.random()}`,
  }));

  return (
    <motion.div className={className} variants={container} initial="hidden" animate="visible">
      {chars.map(({ char, id }) => (
        <motion.span key={id} variants={child}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

RevealText.propTypes = {
  text: PropTypes.string.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// MORPH SHAPE - Formas que se transforman
// ============================================================================

export const MorphShape = ({ isActive, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        borderRadius: isActive ? '50%' : '20%',
        rotate: isActive ? 180 : 0,
        scale: isActive ? 1.2 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    />
  );
};

MorphShape.propTypes = {
  isActive: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// FLOATING ELEMENT - Elemento flotante
// ============================================================================

export const FloatingElement = ({ children, duration = 3, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-10, 10, -10],
        rotateZ: [-2, 2, -2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

FloatingElement.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// STAGGER CONTAINER - Animación escalonada
// ============================================================================

export const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
};

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  staggerDelay: PropTypes.number,
};

export const StaggerItem = ({ children, className = '' }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
};

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// SHIMMER EFFECT - Efecto de brillo
// ============================================================================

export const ShimmerEffect = ({ className = '' }) => {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      }}
      animate={{
        x: ['-100%', '200%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

ShimmerEffect.propTypes = {
  className: PropTypes.string,
};

// ============================================================================
// PULSE GLOW - Pulso con brillo
// ============================================================================

export const PulseGlow = ({ children, color = '#667eea', className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [`0 0 0px ${color}00`, `0 0 20px ${color}80`, `0 0 0px ${color}00`],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

PulseGlow.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// WAVE ANIMATION - Onda animada
// ============================================================================

export const WaveAnimation = ({ className = '' }) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-8 bg-current rounded-full"
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

WaveAnimation.propTypes = {
  className: PropTypes.string,
};

// ============================================================================
// HOVER LIFT - Elevación en hover
// ============================================================================

export const HoverLift = ({ children, liftAmount = 20, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -liftAmount,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
};

HoverLift.propTypes = {
  children: PropTypes.node.isRequired,
  liftAmount: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// TYPEWRITER EFFECT - Efecto de máquina de escribir
// ============================================================================

export const TypewriterText = ({ text, speed = 50, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{
        duration: (text.length * speed) / 1000,
        ease: 'linear',
      }}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      {text}
    </motion.div>
  );
};

TypewriterText.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  className: PropTypes.string,
};

export default {
  Card3D,
  ParallaxContainer,
  MagneticButton,
  RevealText,
  MorphShape,
  FloatingElement,
  StaggerContainer,
  StaggerItem,
  ShimmerEffect,
  PulseGlow,
  WaveAnimation,
  HoverLift,
  TypewriterText,
};
