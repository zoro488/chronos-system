/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        UTILITY: CLASS NAMES                               ║
 * ║  Función helper para combinar clases con clsx + tailwind-merge           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS de manera inteligente
 * Usa clsx para concatenar clases condicionales
 * Usa tailwind-merge para resolver conflictos de Tailwind
 *
 * @example
 * cn('px-4 py-2', condition && 'bg-blue-500', 'text-white')
 * cn({ 'bg-red-500': isError, 'bg-green-500': isSuccess })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
