import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Area {
  id: string;
  nome: string;
  icone?: string;
  descricao?: string;
  quantidadeServicos?: number;
  processos?: any[];
}

export const useAreas = () => {
  return useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          processos(
            id,
            nome,
            subprocessos(
              id,
              nome,
              servicos(count)
            )
          )
        `)
        .eq('ativo', true);
      
      if (error) throw error;
      
      return data.map(area => ({
        ...area,
        quantidadeServicos: area.processos?.reduce((total: number, processo: any) => {
          return total + (processo.subprocessos?.reduce((subTotal: number, subprocesso: any) => {
            return subTotal + (subprocesso.servicos?.[0]?.count || 0);
          }, 0) || 0);
        }, 0) || 0
      })) as Area[];
    },
  });
};

export const useAreaById = (id: string) => {
  return useQuery({
    queryKey: ['area', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select(`
          *,
          processos(
            *,
            subprocessos(
              *,
              servicos(*)
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Area;
    },
    enabled: !!id,
  });
};