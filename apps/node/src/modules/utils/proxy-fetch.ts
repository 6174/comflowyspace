import { HttpsProxyAgent } from 'https-proxy-agent';
import { getSystemProxy } from './env';
import fetch, { Response } from 'node-fetch';

/**
 * use proxy agent by default in node layer to avoid network issue
 * @param url 
 * @param options 
 * @returns 
 */
export async function proxyFetch(url: string, options: any = {}) {
  const { systemProxy } = await getSystemProxy();
  console.log(systemProxy.http_proxy, options);
  const agentOptions = {
    secureProtocol: 'TLSv1_2_method',
  };
  const response: Response = await fetch(url, {
    ...options,
    method: options.method || "GET",
    headers: {
      ...options.headers,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    },
    agent: systemProxy.http_proxy ? new HttpsProxyAgent(systemProxy.http_proxy as string, agentOptions) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${url}. Status: ${response.status} ${response.statusText}`);
  }

  return response;
}

