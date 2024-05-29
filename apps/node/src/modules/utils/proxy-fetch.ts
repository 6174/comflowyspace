import { HttpsProxyAgent } from 'https-proxy-agent';
import { getSystemProxy } from './env';

/**
 * use proxy agent by default in node layer to avoid network issue
 * @param url 
 * @param options 
 * @returns 
 */
export async function proxyFetch(url: string, options: any = {}) {
  const { systemProxy } = await getSystemProxy();
  const agentOptions = {
    secureProtocol: 'TLSv1_2_method',
  };
  const response: Response = await fetch(
    url, {
      ...options,
      agent: systemProxy.http_proxy ? new HttpsProxyAgent(systemProxy.http_proxy as string, agentOptions) : undefined,
  });
  return response;
}