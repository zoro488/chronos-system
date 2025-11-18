# GitHub Copilot Custom Instructions

## Contexto del Proyecto
Este es un ecosistema premium de aplicaciones empresariales con 5 aplicaciones integradas:
1. FlowDistributor - Gestión de flujos de trabajo
2. SmartSales - Sistema de ventas inteligente
3. ClientHub - CRM empresarial
4. AnalyticsPro - Dashboard de analíticas
5. TeamSync - Colaboración en equipo

## Arquitectura Técnica
- **Frontend**: React 18 + Vite
- **Backend**: Firebase v12 (Firestore, Auth, Storage, Analytics)
- **Estilos**: TailwindCSS
- **State Management**: Zustand
- **Formularios**: React Hook Form + Zod
- **Queries**: TanStack Query (React Query)
- **Testing**: Vitest + Playwright
- **3D/Animaciones**: Three.js + Framer Motion
- **Monitoreo**: Sentry + Google Analytics 4

## Directrices de Código

### 1. TypeScript
- Usa TypeScript estricto para todo código nuevo
- Define interfaces para todas las props y estados
- Evita el uso de `any`, usa `unknown` cuando sea necesario
- Usa genéricos para componentes reutilizables

### 2. React
- Componentes funcionales con hooks
- Usa React.memo() para componentes que renderizan frecuentemente
- Implementa useMemo() y useCallback() para optimización
- Lazy load componentes pesados con React.lazy()
- Implementa Error Boundaries para manejo de errores

### 3. Firebase
- Usa la API modular (v12)
- Implementa listeners en tiempo real cuando sea apropiado
- Usa transacciones para operaciones críticas
- Implementa retry logic para operaciones que pueden fallar
- Cachea datos con React Query

### 4. Estilos
- TailwindCSS utility-first approach
- Usa clsx o cn() para clases condicionales
- Implementa variantes con class-variance-authority (cva)
- Mobile-first responsive design
- Dark mode ready (usar CSS variables)

### 5. Performance
- Code splitting por ruta
- Lazy loading de imágenes
- Virtual scrolling para listas largas
- Debounce/throttle en inputs de búsqueda
- Optimistic updates en mutations
- Service Workers para PWA

### 6. Testing
- Unit tests para lógica de negocio
- Component tests para UI
- E2E tests para flujos críticos
- Cobertura mínima del 80%

### 7. Seguridad
- Validación de datos con Zod
- Sanitización de inputs
- CORS configurado correctamente
- Environment variables para secrets
- Rate limiting en operaciones sensibles

### 8. Accesibilidad
- Semantic HTML
- ARIA labels apropiados
- Keyboard navigation completa
- Screen reader friendly
- Contraste de colores WCAG AA

### 9. SEO
- Meta tags dinámicos
- Sitemap.xml actualizado
- robots.txt configurado
- Open Graph tags
- Structured data (Schema.org)

### 10. Documentación
- JSDoc comments para funciones públicas
- README actualizado
- Changelog mantenido
- Comentarios explicativos para lógica compleja
- Diagramas de arquitectura actualizados

## Patrones de Diseño Preferidos

### Custom Hooks
```javascript
// ✅ Bueno
function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser, () => setLoading(false))
  }, [])

  return { user, loading }
}
```

### Componentes Compuestos
```javascript
// ✅ Bueno
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### React Query
```javascript
// ✅ Bueno
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => getUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutos
  retry: 3
})
```

### Zustand Store
```javascript
// ✅ Bueno
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}))
```

### Error Handling
```javascript
// ✅ Bueno
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  Sentry.captureException(error)
  return { success: false, error: error.message }
}
```

## Anti-Patrones a Evitar

### ❌ Props Drilling
```javascript
// ❌ Malo
<ComponentA data={data}>
  <ComponentB data={data}>
    <ComponentC data={data} />
  </ComponentB>
</ComponentA>

// ✅ Bueno - Usa Context o Zustand
const useData = create((set) => ({ data: null }))
```

### ❌ Massive Components
```javascript
// ❌ Malo - Componente de 500+ líneas

// ✅ Bueno - Componentes pequeños y enfocados
<UserProfile>
  <UserAvatar />
  <UserInfo />
  <UserActions />
</UserProfile>
```

### ❌ Mutaciones Directas
```javascript
// ❌ Malo
state.items.push(newItem)

// ✅ Bueno
setState({ items: [...state.items, newItem] })
```

## Estructura de Archivos

```
src/
├── apps/              # Aplicaciones principales
│   ├── FlowDistributor/
│   ├── SmartSales/
│   ├── ClientHub/
│   ├── AnalyticsPro/
│   └── TeamSync/
├── components/        # Componentes compartidos
│   ├── ui/           # Componentes base
│   └── layout/       # Layout components
├── hooks/            # Custom hooks
├── services/         # API services
├── stores/           # Zustand stores
├── utils/            # Utilidades
├── lib/              # Configuraciones de librerías
└── types/            # TypeScript types
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report

# Linting
npm run lint

# Deploy
firebase deploy
```

## Referencias
- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [TailwindCSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev)
- [React Query](https://tanstack.com/query)

---

**Nota**: Estas instrucciones guían a GitHub Copilot para generar código alineado con las mejores prácticas del proyecto.
