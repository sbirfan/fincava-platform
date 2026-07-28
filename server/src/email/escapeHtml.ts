// User-supplied strings (requester name, company, message, etc.) get
// interpolated into email HTML — escape them so a value like
// `<img src=x onerror=...>` can't inject markup into the rendered email.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
