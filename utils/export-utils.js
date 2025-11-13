/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    EXPORT UTILS - UTILIDADES DE EXPORTACIÓN               ║
 * ║   PDF, Excel, PowerPoint, Email - Sistema completo de exportación        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * DEPENDENCIES REQUIRED:
 * npm install jspdf jspdf-autotable xlsx html2canvas
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Exportar a PDF
 */
export const exportToPDF = async (config) => {
  const { title, data, tables, charts, footer } = config;

  const doc = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246); // Purple
  doc.text(title || 'Reporte Chronos', 20, yPosition);
  yPosition += 10;

  // Fecha
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 20, yPosition);
  yPosition += 15;

  // Resumen/Data
  if (data && data.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    data.forEach((item) => {
      doc.text(`• ${item}`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Tablas
  if (tables && tables.length > 0) {
    tables.forEach((table) => {
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text(table.title || 'Tabla', 20, yPosition);
      yPosition += 7;

      doc.autoTable({
        startY: yPosition,
        head: [table.columns],
        body: table.rows,
        theme: 'grid',
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    });
  }

  // Gráficas (como imágenes)
  if (charts && charts.length > 0) {
    for (const chart of charts) {
      try {
        const canvas = await html2canvas(chart.element, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');

        // Nueva página si es necesario
        if (yPosition + 100 > 280) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text(chart.title || 'Gráfica', 20, yPosition);
        yPosition += 7;

        doc.addImage(imgData, 'PNG', 20, yPosition, 170, 80);
        yPosition += 90;
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
      }
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      footer || `Chronos - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar
  doc.save(`${title || 'reporte'}_${Date.now()}.pdf`);

  return {
    success: true,
    message: 'PDF generado exitosamente',
  };
};

/**
 * Exportar a Excel
 */
export const exportToExcel = (config) => {
  const { title, sheets } = config;

  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      // Convertir datos a formato worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([
        [sheet.title || 'Datos'], // Título
        [], // Espacio
        sheet.columns, // Headers
        ...sheet.rows, // Datos
      ]);

      // Estilo (limitado en XLSX)
      worksheet['!cols'] = sheet.columns.map(() => ({ wch: 15 }));

      // Agregar al workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheet.name || `Hoja${sheets.indexOf(sheet) + 1}`
      );
    });

    // Guardar archivo
    XLSX.writeFile(workbook, `${title || 'reporte'}_${Date.now()}.xlsx`);

    return {
      success: true,
      message: 'Excel generado exitosamente',
    };
  } catch (error) {
    console.error('Error generating Excel:', error);
    return {
      success: false,
      message: 'Error al generar Excel',
      error: error.message,
    };
  }
};

/**
 * Exportar a PowerPoint (simplificado - texto plano)
 */
export const exportToPowerPoint = (config) => {
  const { title, slides } = config;

  // Nota: Para PowerPoint completo se requiere PptxGenJS
  // Esta es una versión simplificada usando plain text

  let content = `PRESENTACIÓN: ${title}\n`;
  content += `Generado: ${new Date().toLocaleDateString('es-MX')}\n\n`;
  content += '='.repeat(60) + '\n\n';

  slides.forEach((slide, index) => {
    content += `SLIDE ${index + 1}: ${slide.title}\n`;
    content += '-'.repeat(60) + '\n';

    if (slide.content) {
      if (Array.isArray(slide.content)) {
        slide.content.forEach((item) => {
          content += `• ${item}\n`;
        });
      } else {
        content += slide.content + '\n';
      }
    }

    content += '\n\n';
  });

  // Descargar como archivo de texto (placeholder para PPT real)
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || 'presentacion'}_${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: 'Presentación generada (formato texto)',
    note: 'Instala PptxGenJS para formato PowerPoint real',
  };
};

/**
 * Enviar por Email
 */
export const sendByEmail = async (config) => {
  const { to, subject, body, attachments } = config;

  try {
    // Implementación real requeriría backend
    // Esta es una versión usando mailto: (limitada)

    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    return {
      success: true,
      message: 'Cliente de email abierto',
      note: 'Los archivos adjuntos requieren integración backend',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Error al enviar email',
      error: error.message,
    };
  }
};

/**
 * Programar Reporte Automático
 */
export const scheduleReport = (config) => {
  const { reportId, frequency, recipients, time } = config;

  // Guardar en localStorage (en producción sería backend)
  const schedules = JSON.parse(localStorage.getItem('chronos-scheduled-reports') || '[]');

  const newSchedule = {
    id: Date.now(),
    reportId,
    frequency, // 'daily', 'weekly', 'monthly'
    recipients,
    time, // '09:00'
    createdAt: new Date().toISOString(),
    active: true,
  };

  schedules.push(newSchedule);
  localStorage.setItem('chronos-scheduled-reports', JSON.stringify(schedules));

  return {
    success: true,
    message: 'Reporte programado exitosamente',
    scheduleId: newSchedule.id,
  };
};

/**
 * Obtener Reportes Programados
 */
export const getScheduledReports = () => {
  try {
    const schedules = JSON.parse(localStorage.getItem('chronos-scheduled-reports') || '[]');
    return schedules;
  } catch (error) {
    console.error('Error getting scheduled reports:', error);
    return [];
  }
};

/**
 * Eliminar Reporte Programado
 */
export const deleteScheduledReport = (scheduleId) => {
  try {
    const schedules = JSON.parse(localStorage.getItem('chronos-scheduled-reports') || '[]');
    const filtered = schedules.filter((s) => s.id !== scheduleId);
    localStorage.setItem('chronos-scheduled-reports', JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Formato rápido de datos para tablas
 */
export const formatTableData = (data, columns) => {
  return {
    columns: columns.map((col) => col.label),
    rows: data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        if (col.format) {
          return col.format(value);
        }
        return value;
      })
    ),
  };
};

/**
 * Generar nombre de archivo único
 */
export const generateFileName = (prefix, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
};

/**
 * Convertir datos a CSV
 */
export const exportToCSV = (data, filename) => {
  const { columns, rows } = data;

  // Headers
  let csv = columns.join(',') + '\n';

  // Rows
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
  });

  // Descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'data.csv');
  link.click();
  URL.revokeObjectURL(url);

  return { success: true };
};
