const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 1_900_000;
const MAX_INPUT_PIXELS = 30_000_000;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('El navegador no pudo preparar la imagen.'));
    }, 'image/jpeg', quality);
  });
}

/** Re-encodes identity photos locally so problematic PNG metadata/chunks are discarded. */
export async function prepareIdentityImage(file: File): Promise<File> {
  const extension = file.name.toLowerCase().split('.').pop();
  const supportedMime = file.type === 'image/jpeg' || file.type === 'image/png';
  const supportedExtension = extension === 'jpg' || extension === 'jpeg' || extension === 'png';
  if (!supportedMime && !(file.type === '' && supportedExtension)) {
    throw new Error('Selecciona una imagen JPG o PNG.');
  }
  if (!file.size || file.size > MAX_SOURCE_BYTES) {
    throw new Error('La imagen original debe pesar 20 MB o menos.');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('El navegador no pudo abrir esta imagen. Vuelve a guardarla como JPG o PNG e inténtalo de nuevo.');
  }

  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_INPUT_PIXELS) {
      throw new Error('La foto tiene demasiada resolución. Reduce su tamaño e inténtalo de nuevo.');
    }

    const initialScale = Math.min(1, 3000 / Math.max(bitmap.width, bitmap.height));
    let smallest: Blob | null = null;
    for (const dimension of [3000, 2600, 2200]) {
      const scale = Math.min(initialScale, dimension / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('No se pudo preparar la foto en este navegador.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.86, 0.82]) {
        const output = await canvasToJpeg(canvas, quality);
        if (!smallest || output.size < smallest.size) smallest = output;
        if (output.size <= MAX_OUTPUT_BYTES) {
          const filename = `${file.name.replace(/\.[^.]+$/, '') || 'cedula'}.jpg`;
          return new File([output], filename, { type: 'image/jpeg', lastModified: Date.now() });
        }
      }
    }

    if (smallest && smallest.size <= 2 * 1024 * 1024) {
      return new File([smallest], `${file.name.replace(/\.[^.]+$/, '') || 'cedula'}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    }
    throw new Error('No se pudo reducir la foto a menos de 2 MB. Selecciona una imagen con menor resolución.');
  } finally {
    bitmap.close();
  }
}
