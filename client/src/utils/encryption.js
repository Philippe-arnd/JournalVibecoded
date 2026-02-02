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
  if (!ciphertext || !ENCRYPTION_KEY) {
    if (!ENCRYPTION_KEY && ciphertext?.startsWith?.('U2FsdGVkX1')) {
      console.error('Decryption failed: VITE_ENCRYPTION_KEY is missing but data appears encrypted.');
    }
    return ciphertext;
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText && ciphertext.startsWith('U2FsdGVkX1')) {
      console.error('Decryption failed: Result was empty. This usually means the encryption key is incorrect.');
      return ciphertext;
    }
    
    return originalText || ciphertext;
  } catch (error) {
    console.error('Decryption error:', error);
    return ciphertext;
  }
};
