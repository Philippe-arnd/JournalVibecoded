import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useAutoSave(entryId, data) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!entryId || !data) return;

    // On attend 500ms après la dernière touche
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('entries')
        .update(data)
        .eq('id', entryId);
      
      if (error) console.error("Auto-save failed:", error.message);
      else console.log("Saved...");
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [data, entryId]);
}