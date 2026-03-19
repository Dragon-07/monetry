/**
 * Obtiene la URL base correcta según el entorno (Vercel, Localhost, o una URL configurada).
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Fíjalo como la URL de tu sitio en producción
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Asignado automáticamente por Vercel
    'http://localhost:3000'; // Fallback a localhost

  // Asegúrate de incluir `https://` cuando no sea localhost
  url = url.startsWith('http') ? url : `https://${url}`;
  
  // No incluir la barra invertida al final para facilitar la concatenación (ej. URL + '/auth/callback')
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  
  return url;
};
