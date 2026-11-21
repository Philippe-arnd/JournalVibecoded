import CryptoJS from 'crypto-js';
import { reportError } from '../observability';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('VITE_ENCRYPTION_KEY is not defined. Encryption will be disabled or may fail.');
}

// CryptoJS passphrase output always starts with base64("Salted__").
export const CIPHERTEXT_PREFIX = 'U2FsdGVkX1';
export const hasEncryptionKey = Boolean(ENCRYPTION_KEY);

export const encrypt = (text) => {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    // A production build without the key used to store every entry in clear, silently.
    if (import.meta.env.PROD) {
      const error = new Error('VITE_ENCRYPTION_KEY is missing from this build: refusing to save unencrypted data.');
      reportError(error, { encrypt: { reason: 'missing_key' } });
      throw error;
    }
    return text;
  }
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

// `context` ({ entryId, field }) is only used to identify which stored value failed; on failure the
// ciphertext is still returned unchanged (never a placeholder), so that saving the entry cannot
// overwrite the stored value with something else.
export const decrypt = (ciphertext, context) => {
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
      reportError(new Error('Decryption failed: empty result'), { decrypt: { ...context, length: ciphertext.length } });
      return ciphertext;
    }
    
    return originalText || ciphertext;
  } catch (error) {
    console.error('Decryption error:', error);
    reportError(new Error(`Decryption error: ${error?.message}`), { decrypt: { ...context, length: ciphertext.length } });
    return ciphertext;
  }
};
