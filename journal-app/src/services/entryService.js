import { supabase } from '../lib/supabase';
import { encrypt, decrypt } from '../utils/encryption';

const SENSITIVE_FIELDS = [
  'professional_recap',
  'personal_recap',
  'learning_reflections',
  'gratitude',
  'ai_feedback',
  'ai_cited_entries'
];

export const entryService = {
  // READ: Get all entries for the current user
  async getEntries() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    
    // Decrypt sensitive fields
    return data.map(entry => {
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
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('entry_date', today)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return data;

    // Decrypt sensitive fields
    const decryptedEntry = { ...data };
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    // Use provided date or default to today
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

    const { data, error } = await supabase
      .from('entries')
      .upsert({ 
        user_id: user.id, 
        entry_date: entryDate, 
        ...encryptedData, 
        updated_at: new Date() 
      }, { onConflict: 'user_id, entry_date' })
      .select()
      .single();

    if (error) throw error;

    // Decrypt before returning
    const decryptedData = { ...data };
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
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};