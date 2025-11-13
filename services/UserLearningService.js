/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    USER LEARNING PROFILE SERVICE                           ║
 * ║              Sistema de Aprendizaje de Perfiles de Usuario                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Servicio para gestionar perfiles de usuario inteligentes:
 * - 📊 Tracking de interacciones
 * - 🎯 Detección de patrones de uso
 * - 💡 Preferencias y favoritos
 * - 🔄 Adaptación contextual
 * - 📈 Métricas de engagement
 */

import {
    doc,
    getDoc,
    getFirestore,
    increment,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

/**
 * @typedef {Object} UserLearningProfile
 * @property {string} userId - ID del usuario
 * @property {string} name - Nombre del usuario
 * @property {number} interactions - Total de interacciones
 * @property {Date} lastInteraction - Última interacción
 * @property {Date} createdAt - Fecha de creación del perfil
 * @property {Object} preferences - Preferencias del usuario
 * @property {Object} patterns - Patrones detectados
 * @property {Object} learningData - Datos de aprendizaje
 * @property {Object} metrics - Métricas de uso
 */

/**
 * Servicio de Perfiles de Aprendizaje
 */
export class UserLearningService {
  constructor() {
    this.db = getFirestore();
    this.collectionName = 'user_profiles';
  }

  /**
   * Obtener o crear perfil de usuario
   * @param {string} userId - ID del usuario
   * @param {string} userName - Nombre del usuario (opcional)
   */
  async getOrCreateProfile(userId, userName = null) {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        return { id: profileSnap.id, ...profileSnap.data() };
      }

      // Crear nuevo perfil
      const newProfile = {
        userId,
        name: userName || 'Usuario',
        interactions: 0,
        lastInteraction: serverTimestamp(),
        createdAt: serverTimestamp(),
        preferences: {
          favoriteReports: [],
          commonActions: [],
          preferredFormat: 'excel',
          preferredLanguage: 'es',
          voiceEnabled: false,
          theme: 'dark',
        },
        patterns: {
          mostUsedCollections: [],
          peakUsageTime: null,
          averageSessionDuration: 0,
          commonQueries: [],
          frequentExports: [],
        },
        learningData: {
          queryHistory: [],
          successfulActions: [],
          failedActions: [],
          feedbackScore: 0,
          feedbackCount: 0,
        },
        metrics: {
          totalQueries: 0,
          totalActions: 0,
          totalExports: 0,
          totalVoiceInteractions: 0,
          averageResponseTime: 0,
        },
      };

      await setDoc(profileRef, newProfile);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('✅ Nuevo perfil creado:', userId);
      }

      return { id: userId, ...newProfile };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  /**
   * Registrar interacción del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} interactionData - Datos de la interacción
   */
  async logInteraction(userId, interactionData) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);

      await updateDoc(profileRef, {
        interactions: increment(1),
        lastInteraction: serverTimestamp(),
        'metrics.totalQueries': increment(1),
      });

      // Agregar a historial de queries
      if (interactionData.query) {
        await this.addToQueryHistory(userId, interactionData.query);
      }

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('📝 Interacción registrada:', userId);
      }
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  /**
   * Agregar query al historial
   * @param {string} userId - ID del usuario
   * @param {string} query - Query del usuario
   */
  async addToQueryHistory(userId, query) {
    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const queryHistory = data.learningData?.queryHistory || [];

        // Limitar historial a últimas 50 queries
        const newHistory = [
          {
            query,
            timestamp: new Date().toISOString(),
          },
          ...queryHistory,
        ].slice(0, 50);

        await updateDoc(profileRef, {
          'learningData.queryHistory': newHistory,
        });
      }
    } catch (error) {
      console.error('Error adding to query history:', error);
    }
  }

  /**
   * Registrar acción ejecutada
   * @param {string} userId - ID del usuario
   * @param {Object} action - Acción ejecutada
   * @param {boolean} success - Si fue exitosa
   */
  async logAction(userId, action, success = true) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);

      await updateDoc(profileRef, {
        'metrics.totalActions': increment(1),
      });

      // Agregar a acciones exitosas/fallidas
      const profile = await getDoc(profileRef);
      if (profile.exists()) {
        const data = profile.data();
        const successKey = success ? 'successfulActions' : 'failedActions';
        const actions = data.learningData?.[successKey] || [];

        const newActions = [
          {
            action: action.type,
            params: action.params,
            timestamp: new Date().toISOString(),
          },
          ...actions,
        ].slice(0, 30);

        await updateDoc(profileRef, {
          [`learningData.${successKey}`]: newActions,
        });
      }

      // Actualizar acciones comunes
      if (success) {
        await this.updateCommonActions(userId, action.type);
      }
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  /**
   * Actualizar acciones comunes
   * @param {string} userId - ID del usuario
   * @param {string} actionType - Tipo de acción
   */
  async updateCommonActions(userId, actionType) {
    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const commonActions = data.preferences?.commonActions || [];

        // Contar occurrencias
        const actionCounts = {};
        commonActions.forEach((action) => {
          actionCounts[action] = (actionCounts[action] || 0) + 1;
        });
        actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;

        // Ordenar por frecuencia
        const sortedActions = Object.entries(actionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([action]) => action);

        await updateDoc(profileRef, {
          'preferences.commonActions': sortedActions,
        });
      }
    } catch (error) {
      console.error('Error updating common actions:', error);
    }
  }

  /**
   * Registrar exportación
   * @param {string} userId - ID del usuario
   * @param {string} format - Formato de exportación (pdf/excel)
   */
  async logExport(userId, format) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);

      await updateDoc(profileRef, {
        'metrics.totalExports': increment(1),
        'preferences.preferredFormat': format,
      });

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('📤 Export registrado:', format);
      }
    } catch (error) {
      console.error('Error logging export:', error);
    }
  }

  /**
   * Registrar interacción de voz
   * @param {string} userId - ID del usuario
   */
  async logVoiceInteraction(userId) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);

      await updateDoc(profileRef, {
        'metrics.totalVoiceInteractions': increment(1),
        'preferences.voiceEnabled': true,
      });
    } catch (error) {
      console.error('Error logging voice interaction:', error);
    }
  }

  /**
   * Actualizar colección usada
   * @param {string} userId - ID del usuario
   * @param {string} collectionName - Nombre de la colección
   */
  async updateUsedCollection(userId, collectionName) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const mostUsed = data.patterns?.mostUsedCollections || [];

        // Contar occurrencias
        const collectionCounts = {};
        mostUsed.forEach((col) => {
          collectionCounts[col] = (collectionCounts[col] || 0) + 1;
        });
        collectionCounts[collectionName] = (collectionCounts[collectionName] || 0) + 1;

        // Ordenar por frecuencia
        const sortedCollections = Object.entries(collectionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([col]) => col);

        await updateDoc(profileRef, {
          'patterns.mostUsedCollections': sortedCollections,
        });
      }
    } catch (error) {
      console.error('Error updating used collection:', error);
    }
  }

  /**
   * Registrar feedback del usuario
   * @param {string} userId - ID del usuario
   * @param {number} score - Puntuación (1-5)
   */
  async logFeedback(userId, score) {
    if (!userId || score < 1 || score > 5) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const currentScore = data.learningData?.feedbackScore || 0;
        const currentCount = data.learningData?.feedbackCount || 0;

        const newCount = currentCount + 1;
        const newScore = (currentScore * currentCount + score) / newCount;

        await updateDoc(profileRef, {
          'learningData.feedbackScore': newScore,
          'learningData.feedbackCount': newCount,
        });

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('⭐ Feedback registrado:', score);
        }
      }
    } catch (error) {
      console.error('Error logging feedback:', error);
    }
  }

  /**
   * Obtener recomendaciones para el usuario
   * @param {string} userId - ID del usuario
   */
  async getRecommendations(userId) {
    if (!userId) return [];

    try {
      const profile = await this.getOrCreateProfile(userId);

      const recommendations = [];

      // Recomendar basado en acciones comunes
      if (profile.preferences?.commonActions?.length > 0) {
        recommendations.push({
          type: 'common_action',
          title: 'Acciones frecuentes',
          actions: profile.preferences.commonActions,
        });
      }

      // Recomendar basado en colecciones usadas
      if (profile.patterns?.mostUsedCollections?.length > 0) {
        recommendations.push({
          type: 'favorite_collections',
          title: 'Colecciones favoritas',
          collections: profile.patterns.mostUsedCollections,
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del usuario
   * @param {string} userId - ID del usuario
   */
  async getUserStats(userId) {
    if (!userId) return null;

    try {
      const profile = await this.getOrCreateProfile(userId);

      return {
        totalInteractions: profile.interactions || 0,
        totalQueries: profile.metrics?.totalQueries || 0,
        totalActions: profile.metrics?.totalActions || 0,
        totalExports: profile.metrics?.totalExports || 0,
        totalVoiceInteractions: profile.metrics?.totalVoiceInteractions || 0,
        feedbackScore: profile.learningData?.feedbackScore || 0,
        memberSince: profile.createdAt,
        lastSeen: profile.lastInteraction,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Limpiar datos antiguos del historial
   * @param {string} userId - ID del usuario
   * @param {number} daysOld - Días de antigüedad
   */
  async cleanOldHistory(userId, daysOld = 30) {
    if (!userId) return;

    try {
      const profileRef = doc(this.db, this.collectionName, userId);
      const profile = await getDoc(profileRef);

      if (profile.exists()) {
        const data = profile.data();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        // Limpiar query history
        const queryHistory = (data.learningData?.queryHistory || []).filter((item) => {
          const itemDate = new Date(item.timestamp);
          return itemDate > cutoffDate;
        });

        await updateDoc(profileRef, {
          'learningData.queryHistory': queryHistory,
        });

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('🧹 Historial limpiado');
        }
      }
    } catch (error) {
      console.error('Error cleaning history:', error);
    }
  }
}

export default UserLearningService;
