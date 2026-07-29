import { escapeHtml } from '../escapeHtml.js';

// Shared "label: value" table renderer for founder-notification emails —
// same layout convention as verification.ts, factored out since RFQ/sample/
// sourcing notifications all need it too.
export function renderDetailRows(rows: Array<[string, string]>): { html: string; text: string } {
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const html = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b6459;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${html}</table>`,
    text,
  };
}
