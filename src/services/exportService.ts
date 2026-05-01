import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportService = {
  /**
   * Universal Excel Export Engine (V6.0)
   */
  exportToExcel: async (
    data: any[], 
    config: {
      moduleName: string;
      fileName: string;
      sheetName?: string;
      branding?: { nombre?: string; primaryColor?: string };
      context?: { user?: string; sede?: string };
      showSummary?: boolean;
    }
  ) => {
    const { moduleName, fileName, sheetName = 'Datos', branding, context, showSummary = false } = config;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Get primary color or fallback
    const primaryColor = branding?.primaryColor?.replace('#', '') || '4f46e5';
    
    // --- METADATA HEADER (Rows 1-5) ---
    // A1: Company Name
    const titleCell = worksheet.getCell('A1');
    titleCell.value = (branding?.nombre || 'ST CLÍNICA').toUpperCase();
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF' + primaryColor } };
    
    // A2: Report Title
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `REPORTE: Listado de ${moduleName}`;
    subtitleCell.font = { bold: true, size: 11, name: 'Arial' };
    
    // A3-B4: Metadata Block
    worksheet.getCell('A3').value = `Sede: ${context?.sede || 'Todas las sedes'}`;
    worksheet.getCell('B3').value = `Generado por: ${context?.user || 'Administrador'}`;
    worksheet.getCell('A4').value = `Fecha: ${new Date().toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}`;

    [worksheet.getCell('A3'), worksheet.getCell('B3'), worksheet.getCell('A4')].forEach(c => {
      c.font = { size: 10, color: { argb: 'FF4B5563' }, name: 'Arial' };
    });

    // --- TABLE DATA ---
    const startRow = 6;
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      
      // Define columns (keys only)
      worksheet.columns = headers.map(h => ({ key: h }));

      // Style Header Row (Fila 6)
      const headerRow = worksheet.getRow(startRow);
      headerRow.values = headers.map(h => h.toUpperCase());
      headerRow.height = 25;
      
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF' + primaryColor }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11, name: 'Arial' };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
        };
      });

      // Add Data (starting from Row 7)
      data.forEach((item, index) => {
        const rowIndex = startRow + 1 + index;
        const row = worksheet.insertRow(rowIndex, item);
        row.height = 20;
        const isAlternate = index % 2 !== 0;

        row.eachCell((cell, colNumber) => {
          // All data cells have thin borders
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
          
          if (isAlternate) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          } else {
            cell.fill = { type: 'pattern', pattern: 'none' };
          }

          const headerKey = headers[colNumber - 1];
          const isStatus = /estado/i.test(headerKey);
          
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: isStatus ? 'center' : 'left', 
            wrapText: true,
            indent: isStatus ? 0 : 1
          };
          cell.font = { size: 10, name: 'Arial' };

          // Auto-formatting values
          const val = cell.value;
          
          // Currency formatting
          if (typeof val === 'number' && /monto|precio|total|saldo|pago|cobrado|s\//i.test(headerKey)) {
            cell.numFmt = '"S/" #,##0.00';
          }
          
          // Date formatting
          if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
            const dateVal = val instanceof Date ? val : new Date(val);
            if (!isNaN(dateVal.getTime())) {
              cell.value = dateVal;
              cell.numFmt = 'dd/mm/yyyy';
            }
          }
        });
      });

      // Summary Row (Total de Registros)
      if (showSummary) {
        const lastRow = startRow + data.length;
        const summaryRow = worksheet.getRow(lastRow + 2);
        const totalCell = summaryRow.getCell(1);
        totalCell.value = `TOTAL DE REGISTROS: ${data.length}`;
        
        // Use primary color if provided, otherwise default Indigo
        const summaryColor = primaryColor || '4f46e5';
        
        totalCell.font = { 
          bold: true, 
          size: 11, 
          color: { argb: 'FF' + summaryColor }, 
          name: 'Arial' 
        };
        
        totalCell.border = {
          top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
        };
        summaryRow.commit();
      }

      // AutoFilter for headers
      worksheet.autoFilter = {
        from: { row: startRow, column: 1 },
        to: { row: startRow, column: headers.length }
      };

      // Freeze Panes
      worksheet.views = [{ state: 'frozen', ySplit: startRow }];

      // Auto-fit Columns (V6.1 Algoritmo Optimizado)
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const value = cell.value;
          let cellLength = 0;

          if (value === null || value === undefined) {
            cellLength = 0;
          } else if (value instanceof Date) {
            cellLength = 12;
          } else if (typeof value === 'number') {
            const numStr = value.toLocaleString('es-PE', { minimumFractionDigits: 2 });
            cellLength = numStr.length + 5; 
          } else {
            const lines = value.toString().split('\n');
            cellLength = Math.max(...lines.map(l => l.length));
          }

          if (cellLength > maxLength) maxLength = cellLength;
        });
        column.width = Math.min(Math.max(maxLength + 6, 14), 70);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const finalFileName = `${fileName}_${context?.sede?.replace(/\s+/g, '_') || 'General'}_${dateStr}.xlsx`;
    saveAs(new Blob([buffer]), finalFileName);
  },

  /**
   * Universal PDF Export Engine (V6.0)
   */
  exportToPDF: (
    data: any[],
    config: {
      moduleName: string;
      fileName: string;
      branding?: { logo?: string; nombre?: string; primaryColor?: string; accentColor?: string };
      context?: { user?: string; sede?: string };
    }
  ) => {
    const { moduleName, fileName, branding, context } = config;
    
    // Extract headers and body from generic data
    if (data.length === 0) return;
    const headerKeys = Object.keys(data[0]);
    const headers = [headerKeys.map(k => k.toUpperCase())];
    const body = data.map(item => headerKeys.map(k => item[k]));

    const orientation = headerKeys.length > 7 ? 'landscape' : 'portrait';
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

    const hexToRgb = (hex?: string): [number, number, number] => {
      if (!hex) return [79, 70, 229];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [79, 70, 229];
    };

    const primaryColor = hexToRgb(branding?.primaryColor);
    
    // --- Header Branding ---
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    let logoX = 14;
    if (branding?.logo?.includes('base64')) {
      try {
        doc.addImage(branding.logo, 'PNG', 14, 10, 20, 20);
        logoX = 40;
      } catch (e) {
        console.error("PDF Logo Error:", e);
      }
    }
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(20).setFont('helvetica', 'bold').text((branding?.nombre || 'ST CLÍNICA').toUpperCase(), logoX, 22);
    
    doc.setFontSize(8).setTextColor(148, 163, 184).text('SISTEMA DE GESTIÓN CLÍNICA PROFESIONAL', logoX, 27);

    // Right Side Metadata
    doc.setFontSize(8).setTextColor(100, 116, 139);
    const rm = pageWidth - 14;
    doc.text(`Solicitante: ${context?.user || 'Admin'}`, rm, 15, { align: 'right' });
    doc.text(`Sede: ${context?.sede || 'Global'}`, rm, 20, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleString()}`, rm, 25, { align: 'right' });

    doc.setDrawColor(226, 232, 240).line(14, 32, pageWidth - 14, 32);

    // Title
    doc.setFontSize(14).setTextColor(30, 41, 59).text(`REPORTE: LISTADO DE ${moduleName.toUpperCase()}`, 14, 48);
    doc.setFontSize(9).setTextColor(100, 116, 139).text(`${body.length} registros totales procesados.`, 14, 54);

    // Table
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 60,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor as any,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
      alternateRowStyles: { fillColor: [250, 251, 253] },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: (data) => {
        doc.setFontSize(8).setTextColor(148, 163, 184);
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.text(`Página ${data.pageNumber} de {total_pages_count_string}`, pageWidth - 14, footerY, { align: 'right' });
      }
    });

    if (typeof doc.putTotalPages === 'function') doc.putTotalPages('{total_pages_count_string}');
    doc.save(`${fileName}.pdf`);
  }
};
