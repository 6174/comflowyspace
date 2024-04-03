
// const defaultConfig = {
//   host: window.location.host,
//   protocol: window.location.protocol,
// }
export const comfyuiApiConfig = {
  host: '127.0.0.1:8188',
  protocol: 'http:',
}

const config = {
  host: 'localhost:3333',
  protocol: 'http:',
}

export function getBackendUrl(endpoint: string): string {
  return `${config.protocol}//${config.host}${endpoint}`
}

export function getComfyUIBackendUrl(endpoint: string): string {
  return `${comfyuiApiConfig.protocol}//${comfyuiApiConfig.host}${endpoint}`
}

export default config
