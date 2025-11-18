/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║         FORMULARIO ORDEN DE COMPRA PREMIUM - FLOWDISTRIBUTOR              ║
 * ║  Ultra interactivo, animado, intuitivo y visualmente impactante          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react';
import { z } from 'zod';

import { getDistribuidores } from '../services/distribuidores.service';
import { createOrdenCompra } from '../services/ordenes-compra.service';

// ==================== SCHEMA DE VALIDACIÓN ====================
const productoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0.01, 'Precio debe ser mayor a 0'),
  unidad: z.string().default('pza'),
});

const ordenCompraSchema = z.object({
  distribuidorNombre: z.string().min(2, 'Nombre requerido (mín. 2 caracteres)'),
  productos: z.array(productoSchema).min(1, 'Debe agregar al menos un producto'),
  metodoPago: z.enum(['efectivo', 'transferencia', 'credito', 'cheque']),
  condicionesPago: z.string().optional(),
  notas: z.string().optional(),
});

// ==================== PRODUCTOS SUGERIDOS ====================
const PRODUCTOS_SUGERIDOS = [
  { nombre: 'Laptop Dell XPS 15', precio: 25000, unidad: 'pza', icon: '💻' },
  { nombre: 'Monitor LG 27"', precio: 8500, unidad: 'pza', icon: '🖥️' },
  { nombre: 'Teclado Mecánico RGB', precio: 2500, unidad: 'pza', icon: '⌨️' },
  { nombre: 'Mouse Gaming', precio: 1200, unidad: 'pza', icon: '🖱️' },
  { nombre: 'Silla Ergonómica', precio: 6500, unidad: 'pza', icon: '🪑' },
  { nombre: 'Escritorio Ejecutivo', precio: 12000, unidad: 'pza', icon: '🪑' },
  { nombre: 'Impresora HP LaserJet', precio: 8000, unidad: 'pza', icon: '🖨️' },
  { nombre: 'Tablet Samsung', precio: 15000, unidad: 'pza', icon: '📱' },
];

// ==================== COMPONENTE ====================
export default function FormularioOrdenCompra({ onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [distribuidoresExistentes, setDistribuidoresExistentes] = useState([]);
  const [searchDistribuidor, setSearchDistribuidor] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: {
      distribuidorNombre: '',
      productos: [
        {
          nombre: '',
          descripcion: '',
          cantidad: 1,
          precioUnitario: 0,
          unidad: 'pza',
        },
      ],
      metodoPago: 'credito',
      condicionesPago: 'A crédito 30 días',
      notas: '',
    },
  });

  // Cargar distribuidores existentes
  useEffect(() => {
    const cargarDistribuidores = async () => {
      try {
        const distris = await getDistribuidores();
        setDistribuidoresExistentes(distris);
      } catch (error) {
        console.error('Error al cargar distribuidores:', error);
      }
    };
    cargarDistribuidores();
  }, []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productos',
  });

  const productos = watch('productos');
  const distribuidorNombre = watch('distribuidorNombre');

  const subtotal = productos.reduce(
    (sum, p) => sum + (Number(p.cantidad) || 0) * (Number(p.precioUnitario) || 0),
    0
  );
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Filtrar distribuidores por búsqueda
  const distribuidoresFiltrados = distribuidoresExistentes.filter((d) =>
    d.nombre.toLowerCase().includes(searchDistribuidor.toLowerCase())
  );

  // Función para agregar producto sugerido
  const agregarProductoSugerido = (producto) => {
    append({
      nombre: producto.nombre,
      descripcion: '',
      cantidad: 1,
      precioUnitario: producto.precio,
      unidad: producto.unidad,
    });
    setShowProductSuggestions(false);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const resultado = await createOrdenCompra(data);
      setOrdenCreada(resultado);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        reset();
        if (onSuccess) onSuccess(resultado);
      }, 3000);
    } catch (error) {
      alert('Error al crear orden de compra: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validar paso actual
  const canProceedToStep2 = distribuidorNombre.trim().length >= 2;
  const canProceedToStep3 =
    canProceedToStep2 &&
    productos.length > 0 &&
    productos.every((p) => p.nombre && p.cantidad > 0 && p.precioUnitario > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {showSuccess && (
        <>
          <Confetti recycle={false} numberOfPieces={800} gravity={0.3} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => {
              setShowSuccess(false);
              if (onSuccess) onSuccess(ordenCreada);
            }}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-10 rounded-3xl text-white text-center shadow-2xl border-4 border-white/20 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <CheckCircle2 className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-3">¡Orden Creada Exitosamente! 🎉</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-xl font-semibold mb-1">Folio: {ordenCreada?.folio}</p>
                <p className="text-2xl font-bold">${ordenCreada?.total.toFixed(2)} MXN</p>
              </div>
              <p className="text-green-100 text-sm">
                ✓ Distribuidor registrado ✓ Adeudo creado ✓ Almacén actualizado
              </p>
            </motion.div>
          </motion.div>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Premium con Indicador de Progreso */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-cyan-500 rounded-2xl shadow-2xl"
              >
                <ShoppingCart className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Nueva Orden de Compra
                </h2>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <Sparkles className="w-4 h-4" />
                  Proceso simplificado e inteligente
                </p>
              </div>
            </motion.div>
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onCancel}
                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </motion.button>
            )}
          </div>

          {/* Indicador de Progreso */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { num: 1, label: 'Distribuidor', icon: User },
              { num: 2, label: 'Productos', icon: Package },
              { num: 3, label: 'Confirmación', icon: FileText },
            ].map((step) => (
              <div key={step.num} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.num * 0.1 }}
                  className="flex items-center gap-2 flex-1"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all ${
                      currentStep >= step.num
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 hidden md:block">
                    <p className="text-xs text-slate-400">{step.label}</p>
                  </div>
                </motion.div>
                {step.num < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step.num
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PASO 1: Distribuidor Simplificado */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Distribuidor</h3>
                  <p className="text-slate-400 text-sm">Escribe el nombre del distribuidor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      {...register('distribuidorNombre')}
                      onChange={(e) => setSearchDistribuidor(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                      placeholder="Nombre del distribuidor..."
                      autoFocus
                    />
                  </div>
                  {errors.distribuidorNombre && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.distribuidorNombre.message}
                    </motion.p>
                  )}
                </div>

                {/* Sugerencias de Distribuidores Existentes */}
                {searchDistribuidor && distribuidoresFiltrados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/5 border border-blue-500/30 rounded-xl p-3 max-h-48 overflow-y-auto"
                  >
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Distribuidores existentes:
                    </p>
                    {distribuidoresFiltrados.slice(0, 5).map((dist) => (
                      <motion.button
                        key={dist.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        type="button"
                        onClick={() => {
                          setValue('distribuidorNombre', dist.nombre);
                          setSearchDistribuidor('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-500/20 rounded-lg text-white text-sm transition-all flex items-center justify-between group"
                      >
                        <span>{dist.nombre}</span>
                        <span className="text-xs text-slate-500 group-hover:text-blue-400">
                          Seleccionar
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {distribuidorNombre.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">
                      {distribuidoresExistentes.find((d) => d.nombre === distribuidorNombre)
                        ? '✓ Distribuidor existente encontrado'
                        : '✓ Se creará un nuevo distribuidor'}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => canProceedToStep2 && setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  Continuar a Productos
                  <Zap className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
          {/* PASO 2: Productos con Sugerencias */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Productos</h3>
                    <p className="text-slate-400 text-sm">Agrega los productos de la orden</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowProductSuggestions(!showProductSuggestions)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {showProductSuggestions ? 'Ocultar' : 'Sugerencias'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() =>
                      append({
                        nombre: '',
                        descripcion: '',
                        cantidad: 1,
                        precioUnitario: 0,
                        unidad: 'pza',
                      })
                    }
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </motion.button>
                </div>
              </div>

              {/* Productos Sugeridos */}
              <AnimatePresence>
                {showProductSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4">
                      <p className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        Productos más pedidos:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {PRODUCTOS_SUGERIDOS.map((producto, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => agregarProductoSugerido(producto)}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-xl text-left transition-all group"
                          >
                            <div className="text-2xl mb-1">{producto.icon}</div>
                            <p className="text-xs text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                              {producto.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              ${producto.precio.toLocaleString()}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Productos */}
              <div className="space-y-4 mb-6">
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      className="p-5 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <p className="text-sm font-medium text-slate-300">Producto</p>
                        </div>
                        {fields.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5">
                          <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                          <input
                            {...register(`productos.${index}.nombre`)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Nombre del producto"
                          />
                          {errors.productos?.[index]?.nombre && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.productos[index].nombre.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1">Cantidad *</label>
                          <input
                            {...register(`productos.${index}.cantidad`, { valueAsNumber: true })}
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Cant"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1">Unidad</label>
                          <select
                            {...register(`productos.${index}.unidad`)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          >
                            <option value="pza">Pza</option>
                            <option value="kg">Kg</option>
                            <option value="lt">Lt</option>
                            <option value="caja">Caja</option>
                            <option value="paq">Paquete</option>
                          </select>
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs text-slate-400 mb-1">
                            Precio Unit. *
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              {...register(`productos.${index}.precioUnitario`, {
                                valueAsNumber: true,
                              })}
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-12">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                            <span className="text-xs text-slate-400">Subtotal:</span>
                            <span className="text-lg font-bold text-white">
                              $
                              {(
                                (productos[index]?.cantidad || 0) *
                                (productos[index]?.precioUnitario || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {fields.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay productos agregados</p>
                  </div>
                )}
              </div>

              {/* Navegación */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                >
                  ← Atrás
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => canProceedToStep3 && setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  Continuar a Resumen
                  <Zap className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Confirmación */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Resumen Visual Premium */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirmar Orden</h3>
                    <p className="text-slate-400 text-sm">Revisa los detalles antes de crear</p>
                  </div>
                </div>

                {/* Resumen Distribuidor */}
                <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Distribuidor</h4>
                  </div>
                  <p className="text-lg text-white font-medium">{distribuidorNombre}</p>
                  {distribuidoresExistentes.find((d) => d.nombre === distribuidorNombre) ? (
                    <p className="text-xs text-green-400 mt-1">✓ Distribuidor existente</p>
                  ) : (
                    <p className="text-xs text-cyan-400 mt-1">
                      ✓ Nuevo distribuidor (se creará automáticamente)
                    </p>
                  )}
                </div>

                {/* Resumen Productos */}
                <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-amber-400" />
                    <h4 className="font-semibold text-white">Productos ({productos.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {productos.map((prod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{prod.nombre || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-400">
                            {prod.cantidad} {prod.unidad} × ${prod.precioUnitario.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-white font-bold">
                          ${((prod.cantidad || 0) * (prod.precioUnitario || 0)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen Financiero */}
                <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-lg">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>IVA (16%):</span>
                      <span className="font-semibold text-lg">${iva.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/20 my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">Total:</span>
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                      >
                        ${total.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* Condiciones */}
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 mb-1">Método de Pago:</p>
                      <p className="text-white font-medium capitalize">{watch('metodoPago')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Condiciones:</p>
                      <p className="text-white font-medium">{watch('condicionesPago') || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navegación Final */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                >
                  ← Editar Productos
                </motion.button>
                {onCancel && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                  >
                    Cancelar
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl shadow-green-500/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creando Orden...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Confirmar y Crear Orden
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
