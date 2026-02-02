import { encrypt, decrypt } from '../utils/encryption';

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL = `${VITE_API_URL}/api`;

const SENSITIVE_FIELDS = [
  'professional_recap',
  'personal_recap',
  'learning_reflections',
  'gratitude',
  'ai_feedback',
  'ai_cited_entries'
];

async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include'
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${res.statusText}`);
    }
    return res.json();
}

// Helper to map camelCase (server) to snake_case (client legacy)
function toClientEntry(serverEntry) {
    if (!serverEntry) return null;
    return {
        id: serverEntry.id,
        user_id: serverEntry.userId,
        entry_date: serverEntry.entryDate,
        professional_recap: serverEntry.professionalRecap,
        personal_recap: serverEntry.personalRecap,
        learning_reflections: serverEntry.learningReflections,
        gratitude: serverEntry.gratitude,
        ai_feedback: serverEntry.aiFeedback,
        ai_cited_entries: serverEntry.aiCitedEntries,
        created_at: serverEntry.createdAt,
        updated_at: serverEntry.updatedAt
    };
}

export const entryService = {
  // READ: Get all entries for the current user
  async getEntries() {
    const data = await apiRequest('/entries');
    
    // Decrypt sensitive fields
    return data.map(serverEntry => {
      const entry = toClientEntry(serverEntry);
      const decryptedEntry = { ...entry };
      
      SENSITIVE_FIELDS.forEach(field => {
        if (decryptedEntry[field]) {
          const decryptedValue = decrypt(decryptedEntry[field]);
          // Handle JSON fields
          if (field === 'ai_cited_entries' && typeof decryptedValue === 'string') {
            try {
              decryptedEntry[field] = JSON.parse(decryptedValue);
            } catch (e) {
              decryptedEntry[field] = decryptedValue;
            }
          } else {
            decryptedEntry[field] = decryptedValue;
          }
        }
      });
      return decryptedEntry;
    });
  },

  // READ: Get today's entry if it exists
  async getTodayEntry() {
    const data = await apiRequest('/entries/today');
    if (!data) return null;

    const entry = toClientEntry(data);

    // Decrypt sensitive fields
    const decryptedEntry = { ...entry };
    SENSITIVE_FIELDS.forEach(field => {
      if (decryptedEntry[field]) {
        const decryptedValue = decrypt(decryptedEntry[field]);
        // Handle JSON fields
        if (field === 'ai_cited_entries' && typeof decryptedValue === 'string') {
          try {
            decryptedEntry[field] = JSON.parse(decryptedValue);
          } catch (e) {
            decryptedEntry[field] = decryptedValue;
          }
        } else {
          decryptedEntry[field] = decryptedValue;
        }
      }
    });
    return decryptedEntry;
  },

  // CREATE / UPDATE: Save entry data
  async saveEntry(entryData) {
    const today = new Date().toISOString().split('T')[0];
    const entryDate = entryData.entry_date || today;

    // Encrypt sensitive fields
    const encryptedData = { ...entryData };
    SENSITIVE_FIELDS.forEach(field => {
      if (encryptedData[field]) {
        let valueToEncrypt = encryptedData[field];
        // Handle JSON fields
        if (field === 'ai_cited_entries' && typeof valueToEncrypt !== 'string') {
          valueToEncrypt = JSON.stringify(valueToEncrypt);
        }
        encryptedData[field] = encrypt(valueToEncrypt);
      }
    });

    const data = await apiRequest('/entries', {
        method: 'POST',
        body: JSON.stringify({
            entry_date: entryDate,
            ...encryptedData
        })
    });

    const entry = toClientEntry(data);

    // Decrypt before returning
    const decryptedData = { ...entry };
    SENSITIVE_FIELDS.forEach(field => {
      if (decryptedData[field]) {
        const decryptedValue = decrypt(decryptedData[field]);
        // Handle JSON fields
        if (field === 'ai_cited_entries' && typeof decryptedValue === 'string') {
          try {
            decryptedData[field] = JSON.parse(decryptedValue);
          } catch (e) {
            decryptedData[field] = decryptedValue;
          }
        } else {
          decryptedData[field] = decryptedValue;
        }
      }
    });
    return decryptedData;
  },

  // DELETE: Delete an entry by ID
  async deleteEntry(id) {
    await apiRequest(`/entries/${id}`, {
        method: 'DELETE'
    });
  },
};
