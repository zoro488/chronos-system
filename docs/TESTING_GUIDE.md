# 🧪 Guía Completa de Testing

## 📋 Tabla de Contenidos

- [Tipos de Tests](#tipos-de-tests)
- [Tests Unitarios con Vitest](#tests-unitarios-con-vitest)
- [Tests E2E con Playwright](#tests-e2e-con-playwright)
- [Coverage y Reportes](#coverage-y-reportes)
- [Best Practices](#best-practices)
- [CI Testing](#ci-testing)

---

## 🎯 Tipos de Tests

### Tests Unitarios

- **Framework:** Vitest
- **Ubicación:** `__tests__/`
- **Extensión:** `.test.ts` o `.test.tsx`
- **Propósito:** Probar funciones y componentes individuales

### Tests E2E (End-to-End)

- **Framework:** Playwright
- **Ubicación:** `tests/e2e/`
- **Extensión:** `.spec.ts`
- **Propósito:** Probar flujos completos de usuario

### Tests de Integración

- **Framework:** Vitest + React Testing Library
- **Ubicación:** `__tests__/integration/`
- **Propósito:** Probar interacción entre componentes

---

## 🧪 Tests Unitarios con Vitest

### Configuración

El archivo `vitest.config.ts` ya está configurado:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/__tests__/**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

### Ejecutar Tests

```bash
# Modo watch (recomendado durante desarrollo)
npm run test

# Ejecutar una vez
npm run test:run

# Con UI interactiva
npm run test:ui

# Con cobertura
npm run test:coverage
```

### Estructura de un Test Unitario

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByText('Click');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FormComponent', () => {
  it('should submit form with values', async () => {
    const onSubmit = vi.fn();
    render(<FormComponent onSubmit={onSubmit} />);
    
    // Llenar formulario
    const nameInput = screen.getByLabelText('Nombre');
    await userEvent.type(nameInput, 'John Doe');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Verificar
    expect(onSubmit).toHaveBeenCalledWith({
      nombre: 'John Doe'
    });
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Async Code

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  render(<DataComponent />);
  
  // Mostrar loading inicialmente
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Esperar a que carguen los datos
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Mocking

```typescript
// Mock de funciones
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock de módulos
vi.mock('@/services/api', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([{ id: 1, name: 'John' }]))
}));

// Mock de Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn()
}));
```

---

## 🎭 Tests E2E con Playwright

### Configuración

El archivo `playwright.config.ts` ya está configurado con:
- 6 proyectos (navegadores)
- Servidor de desarrollo automático
- Reportes HTML, JSON, JUnit
- Screenshots y videos on failure

### Ejecutar Tests E2E

```bash
# Todos los navegadores
npm run test:e2e

# Un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# En modo UI (interactivo)
npm run test:e2e:ui

# Ver navegador (headed mode)
npm run test:e2e:headed

# Ver reporte
npm run test:e2e:report
```

### Estructura de un Test E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete purchase flow', async ({ page }) => {
    // 1. Navegar a productos
    await page.click('text=Productos');
    await expect(page).toHaveURL(/productos/);

    // 2. Agregar producto al carrito
    await page.click('button:has-text("Agregar al Carrito")').first();
    
    // 3. Verificar notificación
    await expect(page.locator('.toast')).toContainText('Producto agregado');

    // 4. Ir al carrito
    await page.click('[aria-label="Carrito"]');
    
    // 5. Completar compra
    await page.click('button:has-text("Comprar")');
    
    // 6. Verificar confirmación
    await expect(page.locator('h1')).toContainText('Compra exitosa');
  });
});
```

### Navegación

```typescript
// Ir a una página
await page.goto('/dashboard');

// Navegar con click
await page.click('a[href="/about"]');

// Navegar y esperar
await Promise.all([
  page.waitForNavigation(),
  page.click('button')
]);

// Navegar back/forward
await page.goBack();
await page.goForward();
```

### Interacciones

```typescript
// Click
await page.click('button#submit');

// Type
await page.fill('input[name="email"]', 'user@example.com');
await page.type('input', 'text', { delay: 100 }); // Escribir despacio

// Select
await page.selectOption('select#country', 'US');

// Checkbox
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Upload
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

// Hover
await page.hover('button');

// Drag and drop
await page.dragAndDrop('#source', '#target');
```

### Assertions

```typescript
// Texto visible
await expect(page.locator('h1')).toContainText('Welcome');

// Elemento visible
await expect(page.locator('.modal')).toBeVisible();

// Elemento oculto
await expect(page.locator('.spinner')).toBeHidden();

// Conteo de elementos
await expect(page.locator('.item')).toHaveCount(5);

// Atributo
await expect(page.locator('button')).toHaveAttribute('disabled');

// URL
await expect(page).toHaveURL(/dashboard/);

// Screenshot
await expect(page).toHaveScreenshot('homepage.png');
```

### Waiting

```typescript
// Esperar por selector
await page.waitForSelector('.content', { state: 'visible' });

// Esperar por navegación
await page.waitForLoadState('networkidle');

// Esperar por timeout
await page.waitForTimeout(1000); // Evitar en lo posible

// Esperar por función
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 10;
});
```

### Mobile Testing

```typescript
test.describe('Mobile View', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  });

  test('should display mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Hamburger menu should be visible
    await expect(page.locator('.mobile-menu-button')).toBeVisible();
    
    // Desktop menu should be hidden
    await expect(page.locator('.desktop-menu')).toBeHidden();
  });
});
```

---

## 📊 Coverage y Reportes

### Coverage con Vitest

```bash
# Generar reporte de coverage
npm run test:coverage

# Ver reporte HTML
open coverage/index.html  # Mac
start coverage/index.html  # Windows
xdg-open coverage/index.html  # Linux
```

### Métricas de Coverage

- **Statements:** % de líneas ejecutadas
- **Branches:** % de ramas (if/else) ejecutadas
- **Functions:** % de funciones ejecutadas
- **Lines:** % de líneas de código ejecutadas

### Target de Coverage

- Mínimo: 80%
- Recomendado: 90%
- Excelente: 95%+

### Reportes de Playwright

```bash
# Ver último reporte
npm run test:e2e:report

# Los reportes se generan en:
# - playwright-report/index.html (HTML)
# - playwright-report/results.json (JSON)
# - playwright-report/results.xml (JUnit)
```

---

## ✅ Best Practices

### Tests Unitarios

1. **AAA Pattern:** Arrange, Act, Assert
2. **Nombres descriptivos:** `it('should render error when API fails')`
3. **Un concepto por test:** No mezclar múltiples casos
4. **Tests independientes:** No depender de orden de ejecución
5. **Mock external dependencies:** Firebase, APIs, etc.

### Tests E2E

1. **Test flujos críticos:** Login, checkout, registro
2. **Evitar sleeps:** Usar `waitFor` en su lugar
3. **Selectores estables:** Preferir `data-testid` o roles
4. **Tests aislados:** Cada test debe funcionar solo
5. **Cleanup:** Limpiar datos de test después de ejecutar

### General

1. **DRY:** Extraer setup común a `beforeEach`
2. **Readable:** Tests deben ser fáciles de leer
3. **Fast:** Tests unitarios < 1s, E2E < 30s
4. **Deterministic:** Deben dar mismo resultado siempre
5. **Maintainable:** Actualizar tests con cambios de código

---

## 🚀 CI Testing

### GitHub Actions

Los tests se ejecutan automáticamente en CI con:

```yaml
# Unit tests
- name: 🧪 Run tests with coverage
  run: npm run test:coverage

# E2E tests (matriz de navegadores)
- name: 🎭 Run Playwright tests
  run: npx playwright test --project=${{ matrix.browser }}
```

### Debugging en CI

1. **Ver logs:** Click en el job que falló
2. **Descargar artifacts:** Screenshots y videos
3. **Reproducir localmente:** Usar mismas condiciones

### Optimización de CI

- **Paralelización:** E2E tests corren en paralelo
- **Cache:** Dependencies se cachean
- **Retries:** Tests E2E tienen 2 retries en CI

---

## 🐛 Debugging Tests

### Vitest

```typescript
// Debug con console.log
console.log(result.current.value);

// Debug con screen.debug()
screen.debug(); // Muestra el DOM actual

// Debug específico
screen.debug(screen.getByRole('button'));
```

### Playwright

```typescript
// Modo debug
npx playwright test --debug

// Ver trace
npx playwright show-trace trace.zip

// Screenshot
await page.screenshot({ path: 'debug.png' });

// Pause
await page.pause(); // Pausa ejecución
```

---

## 📚 Referencias

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última actualización:** 2025-11-18
