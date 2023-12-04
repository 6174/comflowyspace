
// const defaultConfig = {
//   host: window.location.host,
//   protocol: window.location.protocol,
// }
const comfyuiApiConfig = {
  host: 'localhost:3333/comfyui',
  protocol: 'http:',
}

const config = {
  host: 'localhost:3333/',
  protocol: 'http:',
}

export function getBackendUrl(endpoint: string): string {
  return `${config.protocol}//${config.host}${endpoint}`
}

export function getComfyUIBackendUrl(endpoint: string): string {
  return `${comfyuiApiConfig.protocol}//${comfyuiApiConfig.host}${endpoint}`
}

export default config
  