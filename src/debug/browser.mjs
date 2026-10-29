/** Add a debug switch and JSON export button to an existing app toolbar. */
export function mountDebugControls(container, logger, { getProjectState } = {}) {
  const label = document.createElement('label');
  label.textContent = 'Debug-Modus ';
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = logger.debugEnabled;
  toggle.addEventListener('change', () => logger.setDebugEnabled(toggle.checked));
  label.append(toggle);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Debug-Log exportieren';
  button.addEventListener('click', () => {
    const projectState = getProjectState?.();
    const blob = new Blob([logger.exportJson({ projectState })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `safety-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  container.append(label, button);
  return () => {
    label.remove();
    button.remove();
  };
}
