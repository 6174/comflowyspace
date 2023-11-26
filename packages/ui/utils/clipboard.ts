export async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    return copyToClipboardOld(text);
  } 
}

function copyToClipboardOld(text: string) {
  // 创建一个临时的 textarea 元素
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // 将 textarea 添加到文档中
  document.body.appendChild(textarea);

  // 选择 textarea 中的文本
  textarea.select();

  // 将文本复制到粘贴板
  document.execCommand('copy');

  // 移除临时的 textarea 元素
  document.body.removeChild(textarea);
}