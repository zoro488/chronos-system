/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         VOICE SERVICE - CHRONOS V2                         ║
 * ║          Reconocimiento de Voz y Síntesis de Voz en Tiempo Real           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Servicios implementados:
 * - 🎤 Speech-to-Text con Deepgram API
 * - 🔊 Text-to-Speech con OpenAI TTS
 * - 📡 Streaming de audio en tiempo real
 * - 🎙️ MediaRecorder para captura de voz
 * - 🔄 Gestión de sesiones de voz
 */

import { createClient } from '@deepgram/sdk';
import OpenAI from 'openai';

/**
 * @typedef {Object} VoiceConfig
 * @property {string} language - Idioma para reconocimiento (default: 'es-MX')
 * @property {string} ttsVoice - Voz para síntesis (default: 'nova')
 * @property {number} sampleRate - Sample rate para audio (default: 16000)
 * @property {boolean} punctuate - Añadir puntuación automática
 * @property {boolean} interim_results - Resultados intermedios
 */

/**
 * Servicio de Voz para CHRONOS V2
 */
export class VoiceService {
  constructor(config = {}) {
    this.config = {
      language: 'es-MX',
      ttsVoice: 'nova',
      sampleRate: 16000,
      punctuate: true,
      interim_results: true,
      ...config,
    };

    // Clientes API
    this.deepgram = null;
    this.openai = null;

    // Estado de grabación
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;

    // Estado de conexión Deepgram
    this.deepgramConnection = null;
    this.isConnected = false;

    // Callbacks
    this.onTranscript = null;
    this.onInterimTranscript = null;
    this.onError = null;
    this.onRecordingStart = null;
    this.onRecordingStop = null;

    // Audio playback
    this.audioContext = null;
    this.currentAudio = null;

    this.initializeClients();
  }

  /**
   * Inicializar clientes de API
   */
  initializeClients() {
    // Deepgram para Speech-to-Text
    const deepgramKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
    if (deepgramKey) {
      try {
        this.deepgram = createClient(deepgramKey);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('✅ Deepgram client initialized');
        }
      } catch (error) {
        console.error('Error initializing Deepgram:', error);
      }
    }

    // OpenAI para Text-to-Speech
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        this.openai = new OpenAI({
          apiKey: openaiKey,
          dangerouslyAllowBrowser: true,
        });
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('✅ OpenAI TTS client initialized');
        }
      } catch (error) {
        console.error('Error initializing OpenAI:', error);
      }
    }

    // Audio Context para playback
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Iniciar grabación de voz
   */
  async startRecording() {
    if (this.isRecording) {
      throw new Error('Ya hay una grabación en curso');
    }

    if (!this.deepgram) {
      throw new Error('Deepgram API key no configurada. Agrega VITE_DEEPGRAM_API_KEY a .env');
    }

    try {
      // Solicitar acceso al micrófono
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.config.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Crear MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });

      this.audioChunks = [];

      // Conectar a Deepgram Live Transcription
      await this.connectToDeepgram();

      // Eventos del MediaRecorder
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // Enviar audio a Deepgram
          if (this.deepgramConnection && this.isConnected) {
            this.deepgramConnection.send(event.data);
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.onRecordingStop) {
          this.onRecordingStop();
        }
      };

      // Iniciar grabación (chunks cada 250ms para real-time)
      this.mediaRecorder.start(250);
      this.isRecording = true;

      if (this.onRecordingStart) {
        this.onRecordingStart();
      }

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('🎤 Grabación iniciada');
      }
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Conectar a Deepgram Live Transcription
   */
  async connectToDeepgram() {
    if (!this.deepgram) return;

    try {
      // Crear conexión live
      this.deepgramConnection = this.deepgram.listen.live({
        language: this.config.language,
        punctuate: this.config.punctuate,
        interim_results: this.config.interim_results,
        smart_format: true,
        model: 'nova-2',
        encoding: 'webm',
        sample_rate: this.config.sampleRate,
      });

      // Eventos de Deepgram
      this.deepgramConnection.on('open', () => {
        this.isConnected = true;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('🔗 Conectado a Deepgram');
        }
      });

      this.deepgramConnection.on('Results', (data) => {
        const transcript = data.channel?.alternatives?.[0];
        if (transcript) {
          const text = transcript.transcript;
          const isFinal = data.is_final;

          if (text && text.trim()) {
            if (isFinal) {
              if (this.onTranscript) {
                this.onTranscript(text);
              }
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log('📝 Transcripción final:', text);
              }
            } else if (this.onInterimTranscript) {
              this.onInterimTranscript(text);
            }
          }
        }
      });

      this.deepgramConnection.on('error', (error) => {
        console.error('Error de Deepgram:', error);
        if (this.onError) {
          this.onError(error);
        }
      });

      this.deepgramConnection.on('close', () => {
        this.isConnected = false;
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('🔌 Desconectado de Deepgram');
        }
      });
    } catch (error) {
      console.error('Error al conectar con Deepgram:', error);
      throw error;
    }
  }

  /**
   * Detener grabación de voz
   */
  async stopRecording() {
    if (!this.isRecording) {
      return;
    }

    try {
      // Detener MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      // Detener stream de audio
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      // Cerrar conexión Deepgram
      if (this.deepgramConnection) {
        this.deepgramConnection.finish();
        this.deepgramConnection = null;
      }

      this.isRecording = false;
      this.isConnected = false;

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('🛑 Grabación detenida');
      }
    } catch (error) {
      console.error('Error al detener grabación:', error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * Sintetizar texto a voz (Text-to-Speech)
   * @param {string} text - Texto a sintetizar
   * @param {Object} options - Opciones de síntesis
   */
  async speak(text, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key no configurada. Agrega VITE_OPENAI_API_KEY a .env');
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      // Opciones de síntesis
      const voiceOptions = {
        model: 'tts-1',
        voice: options.voice || this.config.ttsVoice,
        input: text,
        speed: options.speed || 1.0,
      };

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('🔊 Sintetizando voz...', text.substring(0, 50));
      }

      // Generar audio con OpenAI TTS
      const response = await this.openai.audio.speech.create(voiceOptions);

      // Obtener blob de audio
      const audioBlob = await response.blob();

      // Reproducir audio
      await this.playAudio(audioBlob);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('✅ Audio reproducido');
      }
    } catch (error) {
      console.error('Error al sintetizar voz:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Reproducir audio desde blob
   * @param {Blob} audioBlob - Blob de audio
   */
  async playAudio(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        // Crear URL del blob
        const audioUrl = URL.createObjectURL(audioBlob);

        // Crear elemento de audio
        this.currentAudio = new Audio(audioUrl);

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        };

        // Reproducir
        this.currentAudio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Detener reproducción actual
   */
  stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  /**
   * Verificar si está reproduciendo
   */
  isSpeaking() {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    this.stopRecording();
    this.stopSpeaking();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Verificar disponibilidad de servicios
   */
  static checkAvailability() {
    const availability = {
      microphone: false,
      deepgram: false,
      openai: false,
      audioContext: false,
    };

    // Verificar micrófono
    availability.microphone = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    // Verificar API keys
    availability.deepgram = !!import.meta.env.VITE_DEEPGRAM_API_KEY;
    availability.openai = !!import.meta.env.VITE_OPENAI_API_KEY;

    // Verificar AudioContext
    availability.audioContext = !!(window.AudioContext || window.webkitAudioContext);

    return availability;
  }

  /**
   * Obtener lista de voces disponibles
   */
  static getAvailableVoices() {
    return [
      { id: 'alloy', name: 'Alloy', language: 'es', gender: 'neutral' },
      { id: 'echo', name: 'Echo', language: 'es', gender: 'male' },
      { id: 'fable', name: 'Fable', language: 'es', gender: 'neutral' },
      { id: 'onyx', name: 'Onyx', language: 'es', gender: 'male' },
      { id: 'nova', name: 'Nova', language: 'es', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', language: 'es', gender: 'female' },
    ];
  }
}

export default VoiceService;
