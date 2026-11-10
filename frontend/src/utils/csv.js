// Exportación a CSV sin dependencias. Excel lo abre directo (se antepone BOM UTF-8 para los acentos).

const FORMULA_START = /^[=+\-@\t\r]/;

// Escapa una celda. Los textos que empiezan con =, +, -, @ se marcan con una comilla para que
// Excel no los ejecute como fórmula (inyección de fórmulas con datos escritos por usuarios).
export const csvCell = (value) => {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (typeof value !== 'number' && FORMULA_START.test(text)) text = `'${text}`;
    if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
    return text;
};

// columns: [{ label, value: (fila) => valor }]
export const toCsv = (columns, rows) => {
    const header = columns.map(c => csvCell(c.label)).join(',');
    const lines = rows.map(row => columns.map(c => csvCell(c.value(row))).join(','));
    return [header, ...lines].join('\r\n');
};

export const downloadCsv = (filename, csv) => {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
