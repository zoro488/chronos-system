import { motion } from 'framer-motion';

// Botón con ripple effect
export const RippleButton = ({ children, onClick, ...props }: any) => {
  return (
    <motion.button
      className="relative overflow-hidden px-6 py-3 bg-blue-500 text-white rounded-lg"
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        const ripple = document.createElement('span');
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        e.currentTarget.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
        
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  );
};

// Switch animado
export const AnimatedSwitch = ({ isOn, onToggle }: any) => {
  return (
    <motion.button
      className={`w-14 h-8 rounded-full p-1 ${isOn ? 'bg-blue-500' : 'bg-gray-300'}`}
      onClick={onToggle}
      animate={{ backgroundColor: isOn ? '#3b82f6' : '#d1d5db' }}
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: isOn ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
};

// Loading spinner premium
export const LoadingSpinner = () => {
  return (
    <motion.div
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Progress bar animado
export const AnimatedProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};
