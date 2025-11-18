# 🧪 Testing Strategy - CHRONOS System

## Overview
Comprehensive testing infrastructure to ensure quality, reliability, and maintainability of the CHRONOS business management platform.

## Test Coverage Summary

### Current Status
- **Total Tests**: 121 passing ✅
- **Test Files**: 14 test suites
- **Test Types**: Unit, Integration, E2E
- **Coverage Target**: 80% (currently implementing)

## Testing Stack

### Core Testing Tools
- **Vitest** - Fast unit testing framework
- **@testing-library/react** - React component testing utilities
- **Playwright** - End-to-end browser testing
- **@vitest/coverage-v8** - Code coverage reporting

### Additional Tools
- **jsdom** - DOM implementation for testing
- **@testing-library/jest-dom** - Custom matchers
- **React Hook Form** - Form validation testing
- **Zod** - Schema validation

## Test Structure

```
__tests__/
├── components/           # Component tests
│   ├── all-components.test.tsx
│   └── BaseComponents.test.tsx
├── e2e/                 # Vitest E2E tests
│   └── excel-to-ui-validation.test.ts
├── e2e-playwright/      # Playwright E2E tests
│   ├── auth.spec.ts
│   └── navigation.spec.ts
├── fixtures/            # Test data and mocks
├── forms/              # Form validation tests
│   └── forms.test.ts
├── hooks/              # Custom hooks tests
│   ├── all-hooks.test.tsx
│   └── useBancos.test.tsx
├── integration/        # Integration tests
│   └── flujo-venta.test.ts
├── mocks/             # Mock implementations
├── services/          # Service layer tests
│   ├── all-services.test.ts
│   ├── bancos-v2.service.test.ts
│   ├── clientes.service.test.ts
│   ├── compras.service.test.ts
│   ├── transferencias.service.test.ts
│   └── ventas.service.test.ts
├── utils/             # Utility function tests
│   └── utilities.test.ts
└── setup.ts           # Test setup and configuration
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### Advanced Testing
```bash
# Run specific test file
npm test -- path/to/test.ts

# Run tests matching pattern
npm test -- --grep "authentication"

# Run with specific reporter
npm test -- --reporter=verbose

# Update snapshots
npm test -- -u
```

## Test Types

### 1. Unit Tests
Test individual components, functions, and services in isolation.

**Coverage:**
- ✅ Services (16 tests)
- ✅ Components (15 tests)
- ✅ Forms (10 tests)
- ✅ Hooks (9 tests)
- ✅ Utilities (6 tests)

**Example:**
```typescript
describe('Service Tests', () => {
  it('should fetch data correctly', async () => {
    const result = await getVentas();
    expect(result).toBeDefined();
  });
});
```

### 2. Integration Tests
Test interactions between multiple components/services.

**Coverage:**
- ✅ Venta flow (1 test)
- ✅ Excel to UI validation (39 tests)

**Example:**
```typescript
describe('Integration Flow', () => {
  it('should complete sale + payment', async () => {
    // Test complete business flow
  });
});
```

### 3. E2E Tests (Playwright)
Test complete user workflows in real browser environments.

**Coverage:**
- ✅ Authentication flows
- ✅ Navigation tests
- ✅ Responsive design tests

**Example:**
```typescript
test('user can login', async ({ page }) => {
  await page.goto('/');
  await page.fill('#email', 'test@test.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## CI/CD Integration

### GitHub Actions Workflows

#### 1. Advanced Testing Suite (`.github/workflows/advanced-testing.yml`)
Comprehensive testing pipeline:
- ✅ Unit tests with coverage
- ✅ Integration tests
- ✅ E2E tests (multiple browsers)
- ✅ Type checking
- ✅ Linting
- ✅ Build verification
- ✅ Security audit

#### 2. Standard CI (`.github/workflows/ci.yml`)
Original CI pipeline with extended features:
- Multi-version testing (Node 18, 20, 21)
- Cross-browser E2E testing
- Performance checks
- Bundle size analysis

### Workflow Triggers
- Push to `main`, `develop`, `copilot/**`
- Pull requests
- Manual dispatch

## Test Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
{
  globals: true,
  environment: 'jsdom',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    thresholds: {
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  }
}
```

### Playwright Config (`playwright.config.ts`)
```typescript
{
  testDir: './__tests__/e2e-playwright',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' }
  ]
}
```

## Coverage Goals

### Phase 1: Foundation (Current) ✅
- Basic test infrastructure
- Core service tests
- Component structure tests
- E2E smoke tests
- **Target: 60% coverage**

### Phase 2: Expansion (Next)
- Detailed component tests
- Complex integration flows
- Comprehensive E2E scenarios
- **Target: 70% coverage**

### Phase 3: Excellence (Future)
- Edge case coverage
- Performance testing
- Accessibility testing
- Visual regression testing
- **Target: 80%+ coverage**

## Best Practices

### 1. Test Naming
Use descriptive, behavior-driven names:
```typescript
✅ it('should display error when email is invalid')
❌ it('test email validation')
```

### 2. Test Organization
Group related tests using `describe`:
```typescript
describe('Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials')
    it('should show error with invalid credentials')
  });
});
```

### 3. Test Independence
Each test should be independent:
```typescript
beforeEach(() => {
  // Reset state
  vi.clearAllMocks();
});
```

### 4. Mock External Dependencies
```typescript
vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  addDoc: vi.fn(),
}));
```

### 5. Use Testing Library Queries
```typescript
// ✅ Preferred
screen.getByRole('button', { name: /submit/i })

// ❌ Avoid
container.querySelector('.submit-button')
```

## Debugging Tests

### Vitest Debugging
```bash
# Run with debug output
DEBUG=vitest npm test

# Run single test file
npm test -- path/to/test.ts

# Use browser UI
npm run test:ui
```

### Playwright Debugging
```bash
# Debug mode (opens inspector)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# Generate trace
npx playwright test --trace on
```

### Visual Debugging
```typescript
// In test
await page.pause(); // Pauses execution
await page.screenshot({ path: 'debug.png' });
```

## Continuous Improvement

### Regular Tasks
- [ ] Review and update test coverage weekly
- [ ] Add tests for new features immediately
- [ ] Refactor tests alongside code
- [ ] Update test documentation
- [ ] Monitor test performance

### Metrics to Track
- Test execution time
- Coverage percentage
- Flaky test rate
- Test maintenance cost

## Security Testing

### Vulnerability Scanning
```bash
# npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Dependency Review
Automated via GitHub Actions:
- Dependency review on PRs
- Security alerts
- Automated updates via Dependabot

## Performance Testing

### Lighthouse CI
Automated performance testing in CI:
- Performance score
- Accessibility score
- Best practices
- SEO metrics

### Bundle Size
Monitor build size:
```bash
# Check bundle size
npm run build
du -sh dist/
```

## Accessibility Testing

### Manual Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- ARIA labels

### Automated Testing
```typescript
// Example a11y test
import { axe } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)

### Internal Docs
- `IMPLEMENTATION_ROADMAP.md` - Project roadmap
- `PROJECT_STRUCTURE.md` - Code organization
- `.github/copilot-instructions.md` - Coding standards

## Support

For issues or questions:
1. Check existing test examples
2. Review test documentation
3. Run tests locally before pushing
4. Monitor CI/CD pipeline results

---

**Last Updated**: 2024-11-18  
**Maintained By**: CHRONOS Development Team
