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

type DecodedIdentityImage = {
  image: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function decodeIdentityImage(file: File): Promise<DecodedIdentityImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Fall through to the HTML image decoder for browsers with limited
      // createImageBitmap support or files it cannot decode through that API.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image decode failed'));
      image.src = objectUrl;
    });
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
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

  let decodedImage: DecodedIdentityImage;
  try {
    decodedImage = await decodeIdentityImage(file);
  } catch {
    throw new Error('El navegador no pudo abrir esta imagen. Vuelve a guardarla como JPG o PNG e inténtalo de nuevo.');
  }

  try {
    if (!decodedImage.width || !decodedImage.height || decodedImage.width * decodedImage.height > MAX_INPUT_PIXELS) {
      throw new Error('La foto tiene demasiada resolución. Reduce su tamaño e inténtalo de nuevo.');
    }

    const initialScale = Math.min(1, 3000 / Math.max(decodedImage.width, decodedImage.height));
    let smallest: Blob | null = null;
    for (const dimension of [3000, 2600, 2200]) {
      const scale = Math.min(initialScale, dimension / Math.max(decodedImage.width, decodedImage.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(decodedImage.width * scale));
      canvas.height = Math.max(1, Math.round(decodedImage.height * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('No se pudo preparar la foto en este navegador.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(decodedImage.image, 0, 0, canvas.width, canvas.height);

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
    decodedImage.close();
  }
}
