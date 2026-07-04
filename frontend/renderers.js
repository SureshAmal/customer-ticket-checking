export function label(value, tone) {
  const span = document.createElement('span');
  const labelTone = tone || String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-');

  span.className = `result-label ${labelTone}`;
  span.textContent = value;
  return span;
}
