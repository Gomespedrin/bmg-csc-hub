import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Servico {
  id: string;
  produto: string;
  o_que_e?: string;
  quem_pode_utilizar?: string;
  tempo_medio?: number;
  unidade_medida?: string;
  sla?: number;
  sli?: number;
  ano?: number;
  requisitos_operacionais?: string;
  observacoes?: string;
  demanda_rotina?: string;
  status: string;
  subprocesso: {
    id: string;
    nome: string;
    processo: {
      id: string;
      nome: string;
      area: {
        id: string;
        nome: string;
        icone?: string;
      };
    };
  };
}

export const useServicos = (filters?: any) => {
  return useQuery({
    queryKey: ['servicos', filters],
    queryFn: async () => {
      let query = supabase
        .from('servicos')
        .select(`
          *,
          subprocesso:subprocessos(
            id,
            nome,
            processo:processos(
              id,
              nome,
              area:areas(
                id,
                nome,
                icone
              )
            )
          )
        `)
        .eq('ativo', true)
        .eq('status', 'ativo');

      if (filters?.areas?.length > 0) {
        const areaIds = await getAreaIds(filters.areas);
        query = query.in('subprocesso.processo.area_id', areaIds);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Servico[];
    },
  });
};

export const useServicoById = (id: string) => {
  return useQuery({
    queryKey: ['servico', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servicos')
        .select(`
          *,
          subprocesso:subprocessos(
            id,
            nome,
            processo:processos(
              id,
              nome,
              area:areas(
                id,
                nome,
                icone
              )
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Servico;
    },
    enabled: !!id,
  });
};

const getAreaIds = async (areaNames: string[]) => {
  const { data } = await supabase
    .from('areas')
    .select('id')
    .in('nome', areaNames);
  
  return data?.map(area => area.id) || [];
};