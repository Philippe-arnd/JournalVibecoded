import { supabase } from '../lib/supabase';

export const entryService = {
  // READ: Get all entries for the current user
  async getEntries() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false });
    
    if (error) throw error;
    return data;
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
    return data;
  },

  // CREATE / UPDATE: Save entry data
  async saveEntry(entryData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    // Use provided date or default to today
    const entryDate = entryData.entry_date || today;

    const { data, error } = await supabase
      .from('entries')
      .upsert({ 
        user_id: user.id, 
        entry_date: entryDate, 
        ...entryData, 
        updated_at: new Date() 
      }, { onConflict: 'user_id, entry_date' })
      .select()
      .single();

    if (error) throw error;
    return data;
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