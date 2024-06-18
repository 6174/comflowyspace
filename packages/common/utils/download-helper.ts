/**
 * 用 jszip 实现一个下载 images 的函数
 */
import JSZip from "jszip";
export async function downloadImagesAsZip(images: {src: string, filename: string}[]) {
  const zip = new JSZip();
  const promises = images.map(async (image) => {
    const response = await fetch(image.src);
    const blob = await response.blob();
    zip.file(image.filename, blob);
  });

  await Promise.all(promises);
  const blob = await zip.generateAsync({ type: "blob" });

  const url = URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.download = "images.zip";
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  link.remove();
}

/**
 * Downlaod file
 * @param src 
 * @param filename 
 */
export async function downloadFile(src: string, filename: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  const url = URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  link.remove();
}