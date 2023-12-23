import exifr from 'exifr';
import { PersistedWorkflowDocument } from '../local-storage';

export async function readWorkflowFromFile( file: File ): Promise<PersistedWorkflowDocument> {
  const reader = new FileReader()
  reader.readAsText(file)
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', (ev) => {
      if (ev.target?.result != null && typeof ev.target.result === 'string') {
        resolve(JSON.parse(ev.target.result))
      }
    })
    reader.addEventListener('error', reject)
  });
}

export function writeWorkflowToFile(workflow: PersistedWorkflowDocument): void {
  const a = document.createElement('a')
  a.download = 'workflow.json'
  a.href = URL.createObjectURL(new Blob([JSON.stringify(workflow)], { type: 'application/json' }))
  a.click()
}

export async function readWorkflowFromPng(file: File): Promise<PersistedWorkflowDocument> {
  if (file.type !== 'image/png') {
    throw new Error('Invalid file type. Only PNG images are supported.');
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    image.onload = async () => {
      try {
        const exifData = await exifr.parse(image);
        const workflow = JSON.parse(exifData.workflow)
        console.log('EXIF data:', workflow);
        resolve(workflow);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(image.src);
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image.'));
    };
  });
}