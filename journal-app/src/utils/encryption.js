import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('VITE_ENCRYPTION_KEY is not defined. Encryption will be disabled or may fail.');
}

export const encrypt = (text) => {
  if (!text || !ENCRYPTION_KEY) return text;
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

export const decrypt = (ciphertext) => {
  if (!ciphertext || !ENCRYPTION_KEY) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      // If decryption results in empty string, it might not have been encrypted
      // or the key is wrong. Return ciphertext as fallback.
      return ciphertext;
    }
    return originalText;
  } catch (error) {
    // If it fails to decrypt, it might not be encrypted
    return ciphertext;
  }
};
