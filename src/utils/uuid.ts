/**
 * Genera un UUID compatible con entornos seguros y no seguros (HTTP / no-localhost).
 * crypto.randomUUID() solo está disponible en HTTPS o localhost.
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback para contextos no seguros (HTTP) en dispositivos móviles
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
