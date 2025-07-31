import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFAQ() {
  return useQuery({
    queryKey: ['public-faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('ativo', true)
        .order('ordem, categoria');
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
} 