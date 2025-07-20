// src/hooks/useSugestao.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export function useSugestao(id?: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sugestoes')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { data, loading, error };
}
