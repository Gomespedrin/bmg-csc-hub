import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sugestao {
  id: string;
  tipo: string;
  status: string;
  criado_por: string;
  aprovado_por?: string;
  servico_id?: string;
  dados_sugeridos: any;
  justificativa?: string;
  comentario_admin?: string;
  created_at: string;
  updated_at: string;
}

export const useSugestoes = (status?: string) => {
  return useQuery({
    queryKey: ['sugestoes', status],
    queryFn: async () => {
      let query = supabase
        .from('sugestoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Sugestao[];
    },
  });
};

export const useCreateSugestao = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sugestao: {
      tipo: string;
      dados_sugeridos: any;
      justificativa?: string;
      servico_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sugestoes')
        .insert({
          ...sugestao,
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sugestoes'] });
    },
  });
};

export const useUpdateSugestao = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      comentario_admin 
    }: { 
      id: string; 
      status: string; 
      comentario_admin?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sugestoes')
        .update({
          status,
          comentario_admin,
          aprovado_por: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sugestoes'] });
    },
  });
};