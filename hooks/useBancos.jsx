// ===================================================================
// USE BANCOS HOOK - COMPLETO Y FUNCIONAL
// ===================================================================

import { useEffect, useState } from 'react';
import {
    calcularTotalesBanco,
    crearTransferencia,
    getBanco,
    getMovimientosBancarios,
    getSaldoTotalBancos,
    getTodosBancos,
    getTransferencias,
    subscribeToRFActual,
} from '../services/bancos-v2.service';

/**
 * Hook principal para gestión de bancos
 */
export function useBancos() {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBancos() {
      try {
        setLoading(true);
        const data = await getTodosBancos();
        setBancos(data);
        setError(null);
      } catch (err) {
        console.error('Error en useBancos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBancos();
  }, []);

  const refetch = async () => {
    try {
      const data = await getTodosBancos();
      setBancos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return { bancos, loading, error, refetch };
}

/**
 * Hook para un banco específico
 */
export function useBanco(bancoId) {
  const [banco, setBanco] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bancoId) return;

    async function fetchBanco() {
      try {
        setLoading(true);
        const data = await getBanco(bancoId);
        setBanco(data);
        setError(null);
      } catch (err) {
        console.error('Error en useBanco:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBanco();
  }, [bancoId]);

  return { banco, loading, error };
}

/**
 * Hook para movimientos bancarios
 */
export function useMovimientosBancarios(bancoId, filters = {}) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bancoId) return;

    async function fetchMovimientos() {
      try {
        setLoading(true);
        const data = await getMovimientosBancarios(bancoId, filters);
        setMovimientos(data);
        setError(null);
      } catch (err) {
        console.error('Error en useMovimientosBancarios:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovimientos();
  }, [bancoId, JSON.stringify(filters)]);

  return { movimientos, loading, error };
}

/**
 * Hook para transferencias
 */
export function useTransferencias(bancoId) {
  const [transferencias, setTransferencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bancoId) return;

    async function fetchTransferencias() {
      try {
        setLoading(true);
        const data = await getTransferencias(bancoId);
        setTransferencias(data);
        setError(null);
      } catch (err) {
        console.error('Error en useTransferencias:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransferencias();
  }, [bancoId]);

  return { transferencias, loading, error };
}

/**
 * Hook para crear transferencia
 */
export function useCrearTransferencia() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crear = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await crearTransferencia(data);
      return result;
    } catch (err) {
      console.error('Error en useCrearTransferencia:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { crear, loading, error };
}

/**
 * Hook para saldo total
 */
export function useSaldoTotal() {
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSaldoTotal() {
      try {
        setLoading(true);
        const total = await getSaldoTotalBancos();
        setSaldoTotal(total);
        setError(null);
      } catch (err) {
        console.error('Error en useSaldoTotal:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSaldoTotal();
  }, []);

  return { saldoTotal, loading, error };
}

/**
 * Hook para totales de un banco
 */
export function useTotalesBanco(bancoId) {
  const [totales, setTotales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bancoId) return;

    async function fetchTotales() {
      try {
        setLoading(true);
        const data = await calcularTotalesBanco(bancoId);
        setTotales(data);
        setError(null);
      } catch (err) {
        console.error('Error en useTotalesBanco:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTotales();
  }, [bancoId]);

  return { totales, loading, error };
}

/**
 * Hook para suscripción en tiempo real
 */
export function useBancoRealtime(bancoId) {
  const [banco, setBanco] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bancoId) return;

    const unsubscribe = subscribeToRFActual(bancoId, (data) => {
      setBanco(data);
    });

    return () => unsubscribe();
  }, [bancoId]);

  return { banco, error };
}

export default useBancos;
