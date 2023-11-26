const defaultConfig = {
    host: window.location.host,
    protocol: window.location.protocol,
  }
  
  const hotReloadConfig = {
    host: 'localhost:8188',
    protocol: 'http:',
  }
  
  const config = window.location.port === '5173' ? hotReloadConfig : defaultConfig
  
  export function getBackendUrl(endpoint: string): string {
    return `${config.protocol}//${config.host}${endpoint}`
  }
  
  export default config
  