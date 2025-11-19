/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         CHRONOS GASTO FORM                                 ║
 * ║                  Formulario de Registro de Gastos                          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario completo para registrar gastos operativos:
 * - 9 categorías predefinidas
 * - Monto y método de pago
 * - Proveedor/Beneficiario
 * - Upload de comprobantes (opcional)
 * - Generación de movimiento bancario automático
 *
 * @module GastoForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import PropTypes from 'prop-types';
import { z } from 'zod';

// Components
import { Spinner } from '../components/animations/AnimationSystem';
import { useAuth } from '../components/auth';
import { useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import {
  FormInput,
  FormMoneyInput,
  FormSelect,
  FormTextarea,
} from '../components/ui/FormComponents';
import { FileUpload } from '../components/ui/SpecialComponents';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const gastoSchema = z
  .object({
    folio: z.string().min(1, 'Folio requerido'),
    fecha: z.string().min(1, 'Fecha requerida'),
    categoria: z.enum(
      [
        'servicios',
        'nomina',
        'mantenimiento',
        'renta',
        'transporte',
        'marketing',
        'oficina',
        'impuestos',
        'otro',
      ],
      {
        errorMap: () => ({ message: 'Categoría inválida' }),
      }
    ),
    monto: z.number().min(1, 'El monto debe ser mayor a 0'),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
    banco: z.string().optional(),
    proveedor: z.string().min(1, 'Proveedor/Beneficiario requerido'),
    concepto: z.string().min(1, 'Concepto requerido'),
    referencia: z.string().optional(),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.metodoPago === 'transferencia' && !data.banco) return false;
      return true;
    },
    {
      message: 'Banco requerido para transferencias',
      path: ['banco'],
    }
  );

// ============================================================================
// CONSTANTS
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

const CATEGORIAS = [
  { value: 'servicios', label: '🔧 Servicios', description: 'Agua, luz, internet, etc.' },
  { value: 'nomina', label: '💰 Nómina', description: 'Sueldos y prestaciones' },
  {
    value: 'mantenimiento',
    label: '🛠️ Mantenimiento',
    description: 'Reparaciones y mantenimiento',
  },
  { value: 'renta', label: '🏢 Renta', description: 'Renta de locales/oficinas' },
  { value: 'transporte', label: '🚛 Transporte', description: 'Fletes y transportación' },
  { value: 'marketing', label: '📣 Marketing', description: 'Publicidad y promoción' },
  { value: 'oficina', label: '📋 Oficina', description: 'Papelería y suministros' },
  { value: 'impuestos', label: '🏛️ Impuestos', description: 'Impuestos y contribuciones' },
  { value: 'otro', label: '📦 Otro', description: 'Otros gastos' },
];

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'cheque', label: 'Cheque' },
];

const BANCOS = [
  { value: 'bovedaMonte', label: 'Bóveda Monte' },
  { value: 'bovedaUsa', label: 'Bóveda USA' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'fleteSur', label: 'Flete Sur' },
  { value: 'azteca', label: 'Azteca' },
  { value: 'leftie', label: 'Leftie' },
  { value: 'profit', label: 'Profit' },
];

// ============================================================================
// GASTO FORM COMPONENT
// ============================================================================

export const GastoForm = ({ onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  const [folioCounter, setFolioCounter] = useState(1);
  const toast = useToast();
  const db = getFirestore();
  const { user, userData } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      folio: `G-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      categoria: 'otro',
      monto: 0,
      metodoPago: 'efectivo',
      banco: '',
      proveedor: '',
      concepto: '',
      referencia: '',
      notas: '',
    },
  });

  // Load folio counter on mount
  useEffect(() => {
    const loadFolioCounter = async () => {
      try {
        const gastosSnapshot = await getDocs(
          query(collection(db, 'gastos'), orderBy('createdAt', 'desc'), limit(1))
        );
        if (!gastosSnapshot.empty) {
          const lastGasto = gastosSnapshot.docs[0].data();
          const lastFolio = lastGasto.folio || 'G-0';
          const lastNumber = parseInt(lastFolio.split('-')[1]) || 0;
          setFolioCounter(lastNumber + 1);
          setValue('folio', `G-${(lastNumber + 1).toString().padStart(6, '0')}`);
        } else {
          setValue('folio', 'G-000001');
        }
      } catch (error) {
        console.error('Error loading folio counter:', error);
        setValue('folio', `G-${Date.now()}`);
      }
    };

    loadFolioCounter();
  }, [db, setValue]);

  const watchMetodoPago = watch('metodoPago');
  const watchCategoria = watch('categoria');
  const watchMonto = watch('monto');

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const gastoData = {
        folio: data.folio,
        fecha: Timestamp.fromDate(new Date(data.fecha)),
        categoria: data.categoria,
        monto: data.monto,
        metodoPago: data.metodoPago,
        banco: data.banco || null,
        proveedor: data.proveedor,
        concepto: data.concepto,
        referencia: data.referencia || null,
        notas: data.notas || null,
        comprobantes: comprobantes.map((f) => f.name), // Files stored locally, upload to Storage in production
        estado: 'registrado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user?.uid || 'system',
        createdByName: userData?.displayName || 'Sistema',
      };

      const gastoRef = await addDoc(collection(db, 'gastos'), gastoData);

      // Crear movimiento bancario si aplica
      if (data.metodoPago === 'transferencia' && data.banco) {
        // Get current bank balance
        const bancoRef = doc(db, 'bancos', data.banco);
        const bancoDoc = await getDoc(bancoRef);
        let saldoActual = 0;

        if (bancoDoc.exists()) {
          saldoActual = bancoDoc.data().saldo || 0;
        }

        const nuevoSaldo = saldoActual - data.monto;

        const movimientoData = {
          folio: `MB-${Date.now()}`,
          fecha: Timestamp.fromDate(new Date(data.fecha)),
          banco: data.banco,
          tipo: 'salida',
          categoria: 'gasto',
          monto: data.monto,
          saldoAnterior: saldoActual,
          saldo: nuevoSaldo,
          concepto: `GASTO: ${data.concepto}`,
          referencia: data.referencia || null,
          metodoPago: data.metodoPago,
          relacionadoCon: 'gasto',
          relacionadoId: gastoRef.id,
          notas: data.notas || null,
          createdAt: Timestamp.now(),
          createdBy: user?.uid || 'system',
          createdByName: userData?.displayName || 'Sistema',
        };

        await addDoc(collection(db, 'movimientosBancarios'), movimientoData);

        // Update bank balance
        if (bancoDoc.exists()) {
          await updateDoc(bancoRef, {
            saldo: nuevoSaldo,
            updatedAt: Timestamp.now(),
          });
        }
      }

      toast.success('Gasto registrado exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error guardando gasto:', error);
      toast.error('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const categoriaSeleccionada = CATEGORIAS.find((c) => c.value === watchCategoria);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Registrar Gasto</h2>
        <p className="text-sm text-white/60 mt-1">Registre gastos operativos y administrativos</p>
      </div>

      {/* Folio & Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Folio *" {...register('folio')} error={errors.folio?.message} readOnly />

        <FormInput
          label="Fecha *"
          type="date"
          {...register('fecha')}
          error={errors.fecha?.message}
        />
      </div>

      {/* Categoría */}
      <div>
        <FormSelect
          label="Categoría *"
          options={CATEGORIAS}
          {...register('categoria')}
          error={errors.categoria?.message}
        />
        {categoriaSeleccionada && (
          <p className="text-xs text-white/50 mt-1">{categoriaSeleccionada.description}</p>
        )}
      </div>

      {/* Monto */}
      <div>
        <FormMoneyInput
          label="Monto *"
          {...register('monto', { valueAsNumber: true })}
          error={errors.monto?.message}
        />
        {watchMonto > 0 && (
          <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
            <p className="text-sm text-red-400 font-semibold">
              Salida: -${watchMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* Método de Pago */}
      <FormSelect
        label="Método de Pago *"
        options={METODOS_PAGO}
        {...register('metodoPago')}
        error={errors.metodoPago?.message}
      />

      {/* Banco (si es transferencia) */}
      {watchMetodoPago === 'transferencia' && (
        <FormSelect
          label="Banco *"
          options={BANCOS}
          {...register('banco')}
          error={errors.banco?.message}
        />
      )}

      {/* Proveedor */}
      <FormInput
        label="Proveedor/Beneficiario *"
        {...register('proveedor')}
        error={errors.proveedor?.message}
        placeholder="Nombre del proveedor o beneficiario"
      />

      {/* Concepto */}
      <FormInput
        label="Concepto *"
        {...register('concepto')}
        error={errors.concepto?.message}
        placeholder="Descripción breve del gasto"
      />

      {/* Referencia */}
      <FormInput
        label="Referencia"
        {...register('referencia')}
        placeholder="Número de factura, referencia, etc."
      />

      {/* Comprobantes */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Comprobantes</label>
        <FileUpload
          accept="image/*,.pdf"
          multiple
          maxSize={5 * 1024 * 1024} // 5MB
          onChange={setComprobantes}
        />
        <p className="text-xs text-white/50 mt-1">
          Opcional: Facturas, recibos, comprobantes de pago (máx. 5MB por archivo)
        </p>
      </div>

      {/* Notas */}
      <FormTextarea
        label="Notas"
        {...register('notas')}
        placeholder="Notas adicionales sobre el gasto..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading} className="min-w-[200px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Guardando...</span>
            </div>
          ) : (
            'Registrar Gasto'
          )}
        </Button>
      </div>
    </form>
  );
};

GastoForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default GastoForm;
