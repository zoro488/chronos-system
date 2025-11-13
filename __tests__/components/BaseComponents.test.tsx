import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullPageSpinner, Spinner } from '../../components/ui/BaseComponents';

describe('🎨 BaseComponents - Tests de UI', () => {
  describe('Spinner', () => {
    it('✅ debe renderizar con tamaño por defecto', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeTruthy();
    });

    it('✅ debe aplicar tamaño pequeño', () => {
      const { container } = render(<Spinner size="sm" />);
      const spinner = container.querySelector('svg');
      expect(spinner?.classList.contains('w-4')).toBe(true);
    });

    it('✅ debe aplicar tamaño grande', () => {
      const { container } = render(<Spinner size="lg" />);
      const spinner = container.querySelector('svg');
      expect(spinner?.classList.contains('w-12')).toBe(true);
    });

    it('✅ debe aplicar color purple', () => {
      const { container } = render(<Spinner color="purple" />);
      const spinner = container.querySelector('svg');
      expect(spinner?.classList.contains('text-purple-600')).toBe(true);
    });

    it('✅ debe aplicar className personalizado', () => {
      const { container } = render(<Spinner className="custom-class" />);
      const spinner = container.querySelector('svg');
      expect(spinner?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('FullPageSpinner', () => {
    it('✅ debe renderizar spinner de pantalla completa', () => {
      render(<FullPageSpinner />);
      const container = screen.getByText('Cargando...');
      expect(container).toBeTruthy();
    });

    it('✅ debe mostrar mensaje personalizado', () => {
      render(<FullPageSpinner message="Procesando datos..." />);
      const message = screen.getByText('Procesando datos...');
      expect(message).toBeTruthy();
    });

    it('✅ debe tener estilos de overlay', () => {
      const { container } = render(<FullPageSpinner />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay.classList.contains('fixed')).toBe(true);
      expect(overlay.classList.contains('inset-0')).toBe(true);
    });
  });
});
