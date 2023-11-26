import AES from "crypto-js/aes";
const AES_CIPHER_KEY = "U2FsdGVkX1+X5Q5Q3Q0Q3Q==";

/**
 * 保存 ID 到客户端的时候都不存储明文，而是通过加密算法存储
 * @param text 
 * @returns 
 */
export function AESEncrypt(text: string): string {
  return AES.encrypt(text, AES_CIPHER_KEY).toString();
}

export function AESDecrypt(text: string): string {
  return AES.decrypt(text, AES_CIPHER_KEY).toString();
}