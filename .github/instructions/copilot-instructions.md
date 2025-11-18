# GitHub Copilot Custom Instructions for Premium Ecosystem

## Project Context

This is a premium enterprise application ecosystem with 5 integrated applications:

1. **FlowDistributor** - Workflow management
2. **SmartSales** - Intelligent sales system
3. **ClientHub** - Enterprise CRM
4. **AnalyticsPro** - Analytics dashboard
5. **TeamSync** - Team collaboration

## Technical Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase v12 (Firestore, Auth, Storage, Analytics)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Queries**: TanStack Query (React Query)
- **Testing**: Vitest + Playwright
- **3D/Animations**: Three.js + Framer Motion
- **Monitoring**: Sentry + Google Analytics 4

## Code Generation Rules

### 1. TypeScript Best Practices

- Always use TypeScript best practices
- Define interfaces for all props and states
- Avoid `any`, use `unknown` when necessary
- Use generics for reusable components

### 2. React Guidelines

- Functional components with hooks
- Use React.memo() for frequently rendered components
- Implement useMemo() and useCallback() for optimization
- Lazy load heavy components with React.lazy()
- Implement Error Boundaries for error handling

### 3. Firebase Integration

- Use modular API (v12)
- Implement real-time listeners when appropriate
- Use transactions for critical operations
- Implement retry logic for operations that can fail
- Cache data with React Query

### 4. Error Handling

- Implement comprehensive error handling
- Use try-catch blocks for async operations
- Log errors to Sentry in production
- Provide user-friendly error messages
- Implement fallbacks and recovery mechanisms

### 5. Code Quality

- Add JSDoc comments for all functions
- Include unit tests for all new functionality
- Follow ESLint and Prettier configurations
- Maintain minimum 80% test coverage
- Optimize for performance and accessibility

### 6. Performance Optimization

- Use React 18+ concurrent features when appropriate
- Implement code splitting by route
- Lazy load images and components
- Virtual scrolling for long lists
- Debounce/throttle search inputs
- Optimistic updates in mutations

### 7. Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Screen reader friendly
- WCAG AA color contrast

### 8. Security

- Validate data with Zod schemas
- Sanitize user inputs
- Implement rate limiting
- Use environment variables for secrets
- Follow Firebase security rules

## File Structure Conventions

```
src/
├── apps/              # Main applications
│   ├── FlowDistributor/
│   ├── SmartSales/
│   ├── ClientHub/
│   ├── AnalyticsPro/
│   └── TeamSync/
├── components/        # Shared components
│   ├── ui/           # Base UI components
│   └── layout/       # Layout components
├── hooks/            # Custom hooks
├── services/         # API services
├── stores/           # Zustand stores
├── utils/            # Utilities
├── lib/              # Library configurations
└── types/            # TypeScript types
```

## Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`)

## Testing Requirements

- Write unit tests for all business logic
- Component tests for UI elements
- E2E tests for critical user flows
- Mock external dependencies (Firebase, APIs)
- Test error scenarios and edge cases

## Documentation Standards

- Document complex logic with comments
- Keep README files updated
- Maintain changelog for significant changes
- Use JSDoc for public APIs
- Include usage examples in documentation

## Anti-Patterns to Avoid

- ❌ Props drilling (use Context or Zustand)
- ❌ Massive components (keep under 200 lines)
- ❌ Direct state mutations
- ❌ Hardcoded values (use constants/env vars)
- ❌ Ignoring error handling
- ❌ Missing accessibility attributes
- ❌ Inline styles (use Tailwind classes)
- ❌ Console.logs in production
