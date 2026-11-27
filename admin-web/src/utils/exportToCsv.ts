export function exportToCsv<T extends object>(filename: string, rows: T[]): void {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]) as (keyof T)[];
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const val = row[key];
          const str = val === null || val === undefined ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
