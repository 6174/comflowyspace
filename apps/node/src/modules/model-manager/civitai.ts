import { appConfigManager } from "../config-manager";
import { proxyFetch } from "../utils/proxy-fetch";

const LIST_TOKEN = "eeec53d1caaade212b4a965ced83724c";

export function getCivitAIToken(useDefault = true) {
  let token = appConfigManager.getSetupConfig().civitaiToken;
  if (token === undefined && useDefault) {
    token = LIST_TOKEN
  }
  return token;
}
export function resolveCivitHeaders() {
 
  const token = getCivitAIToken();
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return headers;
}

export async function searchCivitModelFromSHA256(sha256: string) {
  const headers = resolveCivitHeaders();
  const ret = await proxyFetch(`/api/models/search?sha256=${sha256}`, {
    headers
  });
  const data = await ret.json()
  return data
}

export async function getCivitModelById(modelId: string) {
  const headers = resolveCivitHeaders();
  const ret = await proxyFetch(`https://api.civitai.com/v1/model?modelId=${modelId}`, {
    headers,
  })
  const data = await ret.json()
  return data
}

export async function getCivitModelByVersionId(modelVersionId: string) {
  const headers = resolveCivitHeaders();
  const ret = await proxyFetch(`https://api.civitai.com/v1/models?modelVersionId=${modelVersionId}`, {
    headers
  });
  const data = await ret.json()
  return data
}

export async function getCivitModelByHash(hash: string) {
  const headers = resolveCivitHeaders();
  const ret = await proxyFetch(`https://civitai.com/api/v1/model-versions/by-hash/${hash}`, {
    headers
  });
  const data = await ret.json()
  return data
}

export async function listCivitModels(params: any = {}) {
  const { limit = 10, page = 1, query = "", modelId, modelVersionId, nsfw, sort, tag, types, cursor } = params;
  const filters: any = {
    limit,
    page,
    sort: sort || "Highest Rated",
    primaryFileOnly: true,
    types: types && (types !== "" ? types : ["Checkpoint"]).join(","),
  }

  if (query && query !== "") {
    filters.query = query;
  }

  if (nsfw) {
    filters.nsfw = nsfw;
  }

  if (cursor) {
    filters.cursor = cursor;
  }

  const headers = resolveCivitHeaders();
  const queryString = Object.keys(filters).filter(key => !!filters[key]).map(key => key + '=' + filters[key]).join('&');
  console.log("query string", queryString);
  const ret = await proxyFetch(`https://api.civitai.com/v1/models?${queryString}`, {
    headers
  });

  const data = await ret.json()

  return data
}