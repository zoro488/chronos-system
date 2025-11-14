import { motion } from 'framer-motion';
import { InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      {label && (
        <motion.label
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <motion.input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            bg-white dark:bg-gray-800
            border-2 rounded-xl
            transition-all duration-300
            ${isFocused 
              ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${error ? 'border-red-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {error && (
          <motion.p
            className="mt-1 text-sm text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};
