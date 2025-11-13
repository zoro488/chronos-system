/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SPECIAL COMPONENTS                              ║
 * ║          FileUpload, ColorPicker, DateRangePicker Premium                  ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes especiales:
 * - FileUpload (drag & drop con preview)
 * - ColorPicker (selector de color)
 * - DateRangePicker (rango de fechas)
 * - ImagePreview (visor de imágenes)
 *
 * @module SpecialComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// FILE UPLOAD
// ============================================================================

/**
 * FileUpload - Drag & drop file upload con preview
 */
export const FileUpload = ({
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  onChange,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    // Filter by max size
    const validFiles = newFiles.filter((file) => file.size <= maxSize);

    if (validFiles.length !== newFiles.length) {
      alert(`Algunos archivos exceden el tamaño máximo de ${maxSize / 1024 / 1024}MB`);
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);
    if (onChange) onChange(updatedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onChange) onChange(updatedFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all',
          'flex flex-col items-center justify-center gap-4',
          isDragging
            ? 'border-[#667eea] bg-[#667eea]/10'
            : 'border-white/20 hover:border-[#667eea]/50 bg-white/5'
        )}
      >
        <div className="text-6xl">📁</div>
        <div className="text-center">
          <p className="text-white font-medium mb-1">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-white/50">Máximo {maxSize / 1024 / 1024}MB por archivo</p>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10"
              >
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-white/50">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

FileUpload.propTypes = {
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

// ============================================================================
// COLOR PICKER
// ============================================================================

/**
 * ColorPicker - Selector de color simple
 */
export const ColorPicker = ({ value = '#667eea', onChange, presets = [], className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultPresets = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#330867',
  ];

  const colors = presets.length > 0 ? presets : defaultPresets;

  return (
    <div className={cn('relative', className)}>
      {/* Color Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg border-2 border-white/20"
          style={{ backgroundColor: value }}
        />
        <span className="text-white font-mono">{value}</span>
      </button>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 p-4 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl z-10"
          >
            {/* Preset Colors */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-10 h-10 rounded-lg transition-all',
                    'hover:scale-110',
                    value === color && 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

ColorPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  presets: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

// ============================================================================
// DATE RANGE PICKER
// ============================================================================

/**
 * DateRangePicker - Selector de rango de fechas
 */
export const DateRangePicker = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  maxDate,
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Start Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-white/70 mb-2">Fecha Inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          min={minDate}
          max={endDate || maxDate}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50"
        />
      </div>

      {/* Arrow */}
      <div className="text-white/50 pt-6">→</div>

      {/* End Date */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-white/70 mb-2">Fecha Fin</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          min={startDate || minDate}
          max={maxDate}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50"
        />
      </div>
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onStartChange: PropTypes.func.isRequired,
  onEndChange: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// IMAGE PREVIEW
// ============================================================================

/**
 * ImagePreview - Visor de imágenes con zoom
 */
export const ImagePreview = ({ src, alt = 'Imagen', onClose, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <AnimatePresence>
      {src && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={cn('relative max-w-4xl max-h-full', className)}>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>

              {/* Image */}
              <motion.img
                src={src}
                alt={alt}
                onClick={() => setIsZoomed(!isZoomed)}
                animate={{ scale: isZoomed ? 1.5 : 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-[80vh] object-contain rounded-xl cursor-zoom-in"
              />

              {/* Zoom Hint */}
              <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-white/50">
                Click para {isZoomed ? 'alejar' : 'acercar'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

ImagePreview.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  FileUpload,
  ColorPicker,
  DateRangePicker,
  ImagePreview,
};
