# 💬 Prompts Útiles para GitHub Copilot - FlowDistributor

## 🎯 Guía de Prompts Optimizados

Esta guía contiene prompts específicos y optimizados para trabajar con GitHub Copilot en FlowDistributor.

---

## 📊 ANÁLISIS Y REPORTES

### Generar Reporte de Ventas por Cliente
```
Crear función que genere un reporte detallado de ventas por cliente en FlowDistributor.
Debe incluir:
- Total vendido por cliente
- Adeudo pendiente
- Porcentaje de cobro (pagado/total)
- Número de ventas
- Fecha de última venta
Retornar array ordenado por total vendido (mayor a menor)
```

### Análisis de Rentabilidad
```
Crear función que calcule la rentabilidad de cada venta en FlowDistributor.
Considerar:
- Utilidades netas (ya calculadas)
- Costo del flete si aplica
- Porcentaje de ganancia
- Retornar solo ventas con utilidad > 0
Ordenar por porcentaje de ganancia descendente
```

### Dashboard de Métricas
```
Crear hook personalizado useDashboardMetrics para FlowDistributor que calcule:
- Total de ventas del mes actual
- Promedio de venta
- Cliente con mayor deuda
- Producto más vendido
- Banco con mayor saldo
Usar useMemo para optimizar rendimiento
```

---

## 🔍 BÚSQUEDA Y FILTROS

### Filtro por Rango de Fechas
```
Crear componente DateRangeFilter para FlowDistributor que permita:
- Seleccionar fecha inicio y fin
- Filtrar ventas/compras en ese rango
- Mostrar totales del período
- Limpiar filtro con un botón
Usar date-fns para manipulación de fechas
```

### Búsqueda Multicriterio
```
Mejorar la búsqueda actual de FlowDistributor para permitir:
- Buscar por múltiples campos simultáneamente (cliente, OC, producto)
- Usar operadores AND/OR
- Guardar búsquedas frecuentes
- Exportar resultados filtrados
```

### Filtro por Estado de Pago
```
Crear selector de filtro para ventas en FlowDistributor:
- Todas
- Solo pendientes
- Solo pagadas
- Adeudo mayor a X cantidad
Actualizar vista en tiempo real con framer-motion
```

---

## ✏️ EDICIÓN Y VALIDACIÓN

### Edición Inline de Registros
```
Implementar edición inline para tabla de ventas en FlowDistributor:
- Hacer clic en celda para editar
- Validar datos en tiempo real
- Guardar con Enter o cancelar con Esc
- Mostrar indicador de guardado
- Recalcular totales automáticamente
Mantener el mismo estilo glass y animaciones
```

### Validador de Stock
```
Crear función validateStock para FlowDistributor que:
- Verifique si hay stock suficiente antes de vender
- Muestre cantidad disponible vs requerida
- Sugiera cantidades alternativas
- Retorne objeto con isValid y mensaje
Integrar con showNotification existente
```

### Validador de Adeudos
```
Implementar validación de límite de crédito para clientes en FlowDistributor:
- Definir límite por cliente
- Alertar si nueva venta excede límite
- Mostrar adeudo actual vs límite
- Permitir override con confirmación
```

---

## 📈 VISUALIZACIONES

### Gráfica de Tendencias de Ventas
```
Agregar gráfica de línea en Dashboard de FlowDistributor usando Recharts:
- Eje X: últimos 12 meses
- Eje Y: total de ventas
- Tooltip con detalles
- Animación al cargar
- Responsive
Datos desde el estado ventas agrupados por mes
```

### Gráfica de Top 10 Clientes
```
Crear componente TopClientesChart para FlowDistributor:
- Bar chart horizontal con Recharts
- Top 10 clientes por total comprado
- Colores degradados
- Click para ver detalle del cliente
- Animación de entrada
```

### Indicadores de Estado (KPI Cards)
```
Crear componente KPICard reutilizable para FlowDistributor:
- Icono personalizable
- Valor principal (grande)
- Título descriptivo
- Cambio porcentual vs mes anterior
- Color según si aumentó/disminuyó
- Animación con framer-motion
Usar en Dashboard para métricas principales
```

---

## 💰 CÁLCULOS Y FINANZAS

### Calculadora de Fletes
```
Crear función calculateFletes en FlowDistributor que:
- Reciba cantidad y tipo de producto
- Calcule flete según tarifas ($500 base)
- Considere descuentos por volumen
- Retorne desglose detallado
Incluir JSDoc completo
```

### Proyección de Ingresos
```
Implementar función projectRevenue para FlowDistributor:
- Analizar ventas de últimos 3 meses
- Calcular promedio mensual
- Proyectar próximos 3 meses
- Considerar estacionalidad si existe
- Retornar array con proyecciones
```

### Conciliación Bancaria
```
Crear función reconcileBank para FlowDistributor que:
- Compare saldo calculado vs saldo real del banco
- Identifique diferencias
- Sugiera transacciones faltantes
- Genere reporte de conciliación
Usar los datos de bancos.bovedaMonte, etc.
```

---

## 🔔 NOTIFICACIONES Y ALERTAS

### Sistema de Alertas de Stock Bajo
```
Implementar hook useStockAlerts en FlowDistributor:
- Monitorear stock en tiempo real
- Alertar si stock < mínimo (definir threshold)
- Mostrar notificación toast
- Listar productos con stock bajo
- Botón para generar orden de compra
Usar useEffect con intervalo
```

### Recordatorios de Pagos Pendientes
```
Crear componente PaymentReminders para FlowDistributor:
- Mostrar ventas pendientes próximas a vencer
- Agrupar por cliente
- Ordenar por urgencia
- Botón para registrar pago
- Notificación diaria
```

### Alertas de Límites de Crédito
```
Implementar sistema de alertas cuando cliente se acerca al límite de crédito:
- Verificar en cada venta nueva
- Alertar al 80% del límite
- Bloquear al 100%
- Mostrar en panel de clientes
- Notificación visual en sidebar
```

---

## 📤 EXPORTACIÓN E IMPORTACIÓN

### Exportar a CSV
```
Crear función exportToCSV en FlowDistributor para exportar:
- Ventas del período seleccionado
- Incluir todos los campos relevantes
- Formato compatible con Excel
- Descargar automáticamente
- Mostrar progreso si son muchos registros
```

### Exportar Reporte PDF
```
Implementar exportación a PDF de reportes en FlowDistributor:
- Usar jsPDF o similar
- Incluir logo y header
- Tablas con totales
- Gráficas embebidas
- Footer con fecha de generación
Crear template reutilizable
```

### Importar desde CSV
```
Crear función importFromCSV en FlowDistributor:
- Leer archivo CSV
- Validar estructura
- Mapear columnas
- Confirmar antes de importar
- Mostrar preview de datos
- Manejar errores gracefully
```

---

## 🎨 UI/UX MEJORAS

### Modo Compacto/Expandido
```
Implementar toggle para vista compacta en tablas de FlowDistributor:
- Reducir padding y tamaños de fuente
- Mostrar más registros por página
- Guardar preferencia en localStorage
- Transición suave con framer-motion
```

### Temas Personalizables
```
Crear sistema de temas para FlowDistributor:
- Modo oscuro (actual)
- Modo claro
- Alto contraste
- Colores personalizables
- Guardar en localStorage
- Toggle en header
Usar CSS variables
```

### Atajos de Teclado
```
Implementar hotkeys para FlowDistributor:
- Ctrl+N: Nueva venta
- Ctrl+F: Buscar
- Ctrl+S: Guardar cambios
- Esc: Cerrar modal
- Ctrl+B: Crear respaldo
Usar biblioteca como react-hotkeys-hook
```

---

## 🔄 OPTIMIZACIÓN

### Virtualización de Listas Largas
```
Implementar virtualización para tabla de ventas en FlowDistributor:
- Usar react-window o react-virtual
- Renderizar solo filas visibles
- Mantener scroll smooth
- Compatible con búsqueda y filtros
Mejorar rendimiento con >100 registros
```

### Lazy Loading de Componentes
```
Optimizar carga inicial de FlowDistributor con lazy loading:
- Dividir componentes grandes
- Usar React.lazy() y Suspense
- Mostrar skeletons mientras carga
- Precargar componentes frecuentes
Reducir tiempo de carga inicial
```

### Memoización Avanzada
```
Optimizar cálculos en FlowDistributor con memoización:
- Identificar cálculos costosos
- Usar useMemo apropiadamente
- Implementar React.memo en componentes puros
- Evitar re-renders innecesarios
Medir con React DevTools Profiler
```

---

## 🔐 SEGURIDAD Y VALIDACIÓN

### Validación de Formularios
```
Crear hook useFormValidation para FlowDistributor:
- Validar campos requeridos
- Validar tipos de datos
- Validar rangos (números positivos, etc.)
- Mostrar errores en tiempo real
- Retornar isValid y errors
Reutilizable en todos los formularios
```

### Sanitización de Inputs
```
Implementar sanitización de inputs en FlowDistributor:
- Prevenir XSS
- Escapar caracteres especiales
- Validar formato de fechas
- Limpiar espacios en blanco
- Aplicar automáticamente en todos los inputs
```

### Confirmaciones para Acciones Críticas
```
Mejorar diálogos de confirmación en FlowDistributor:
- Modal personalizado (no usar alert())
- Mostrar consecuencias de la acción
- Requerir confirmación escrita para borrados masivos
- Timeout para acciones irreversibles
Usar framer-motion para animaciones
```

---

## 📱 RESPONSIVE Y MOBILE

### Adaptación Mobile
```
Mejorar responsive de FlowDistributor para móvil:
- Tablas convertir a cards en mobile
- Sidebar colapsable
- Touch gestures (swipe para eliminar)
- Teclado numérico para campos de cantidad
- Botones de acción más grandes
Usar Tailwind breakpoints
```

### PWA Features
```
Convertir FlowDistributor en PWA:
- Service Worker para cache
- Funcionalidad offline básica
- Instalar como app
- Notificaciones push
- Manifest.json configurado
```

---

## 🧪 TESTING

### Tests Unitarios
```
Crear tests para funciones de cálculo en FlowDistributor:
- Test para calcularFletes()
- Test para calcularUtilidades()
- Test para deleteVenta() cascade
- Usar Jest y React Testing Library
- Coverage > 80%
```

### Tests de Integración
```
Implementar test end-to-end para flujo completo en FlowDistributor:
1. Crear orden de compra
2. Registrar entrada a almacén
3. Crear venta
4. Verificar actualización de stock
5. Verificar movimientos bancarios
Usar Playwright
```

---

## 🎯 INTEGRACIONES

### API REST
```
Crear API endpoints para FlowDistributor:
- GET /api/ventas
- POST /api/ventas
- PUT /api/ventas/:id
- DELETE /api/ventas/:id
Usar Express.js
Retornar JSON
Validación con Joi
```

### WebSocket para Real-Time
```
Implementar WebSocket en FlowDistributor para:
- Actualización en tiempo real entre usuarios
- Notificaciones instantáneas
- Sincronización de datos
- Usar Socket.io
```

---

## 💡 FORMATO DE PROMPT IDEAL

### Template General
```
Crear [tipo de componente/función] para FlowDistributor que:
- [Funcionalidad principal]
- [Característica específica 1]
- [Característica específica 2]
- [Integración con sistema existente]
[Tecnología/patrón a usar]
[Optimizaciones o consideraciones]
```

### Ejemplo de Prompt Bien Estructurado
```
Crear función calculateMonthlyRevenue para FlowDistributor que:
- Reciba un mes y año como parámetros
- Filtre ventas de ese período
- Calcule total de ingresos
- Calcule total de gastos
- Retorne ganancia neta
Usar el estado ventas existente
Optimizar con useMemo
Incluir JSDoc completo con tipos
```

---

## 📚 RECURSOS ADICIONALES

### Consultar Documentación
```
Para más contexto sobre FlowDistributor, consulta:
- FLOWDISTRIBUTOR_CONTEXT.md (este archivo)
- ANALISIS_EXCEL_Y_ADAPTACION.md (lógica de negocio)
- README_FLOWDISTRIBUTOR_EXCEL.md (manual completo)
```

### Patrones de Código
```
Siempre seguir estos patrones en FlowDistributor:
1. Validación defensiva (|| [] y ?.)
2. useMemo para cálculos
3. useCallback para funciones
4. Animaciones con framer-motion
5. Notificaciones con showNotification()
```

---

**Tip Final**: Cuanto más específico y detallado sea el prompt, mejores sugerencias generará Copilot. Siempre menciona "FlowDistributor" y el contexto del sistema.
