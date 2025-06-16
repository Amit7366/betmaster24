import CryptoJS from "crypto-js";

export function aes256EncryptBrowser(key: string, plaintext: string): string {
  const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.AES.encrypt(plaintext, keyUtf8, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Base64 output
}
