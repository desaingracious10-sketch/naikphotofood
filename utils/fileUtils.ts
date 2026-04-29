export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const cropImageToRatio = (base64Data: string, targetRatioString: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const [targetW, targetH] = targetRatioString.split(':').map(Number);
    const targetRatio = targetW / targetH;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const originalWidth = img.width;
      const originalHeight = img.height;
      const originalRatio = originalWidth / originalHeight;

      if (Math.abs(originalRatio - targetRatio) < 0.01) {
        resolve(base64Data);
        return;
      }

      let newWidth, newHeight, startX, startY;

      if (originalRatio > targetRatio) {
        newHeight = originalHeight;
        newWidth = newHeight * targetRatio;
        startX = (originalWidth - newWidth) / 2;
        startY = 0;
      } else {
        newWidth = originalWidth;
        newHeight = newWidth / targetRatio;
        startX = 0;
        startY = (originalHeight - newHeight) / 2;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.drawImage(img, startX, startY, newWidth, newHeight, 0, 0, newWidth, newHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = base64Data;
  });
};

export const pcmToWav = (pcmData: ArrayBuffer, numChannels: number, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.byteLength);
    const view = new DataView(buffer);
    const writeString = (v: DataView, o: number, s: string) => { 
        for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); 
    };
    
    const blockAlign = numChannels * 2;
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.byteLength, true);
    
    new Int16Array(buffer, 44).set(new Int16Array(pcmData));
    return new Blob([view], { type: 'audio/wav' });
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};
