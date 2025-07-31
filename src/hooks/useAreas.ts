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

export interface AreaCompleta extends Area {
  processos: {
    id: string;
    nome: string;
    descricao?: string;
    subprocessos: {
      id: string;
      nome: string;
      descricao?: string;
      servicos: {
        id: string;
        produto: string;
        status: string;
        tempo_medio?: number;
        sla?: number;
        demanda_rotina?: string;
      }[];
    }[];
  }[];
}

export const useAreas = () => {
  return useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('id, nome, descricao, icone, ativo, created_at, updated_at')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      
      console.log('📊 Raw areas data from Supabase:', data?.map(a => ({ id: a.id, nome: a.nome, ativo: a.ativo })));
      console.log('🔍 Sample area ID type:', typeof data?.[0]?.id);
      
      // Buscar processos para cada área
      const areasWithProcessos = await Promise.all(
        data.map(async (area) => {
          const { data: processos } = await supabase
            .from('processos')
            .select('id, nome, descricao')
            .eq('area_id', area.id)
            .eq('ativo', true)
            .order('nome');

          // Buscar subprocessos para cada processo
          const processosCompletos = await Promise.all(
            (processos || []).map(async (processo) => {
              const { data: subprocessos } = await supabase
                .from('subprocessos')
                .select('id, nome, descricao')
                .eq('processo_id', processo.id)
                .eq('ativo', true)
                .order('nome');

              // Buscar serviços para cada subprocesso
              const subprocessosCompletos = await Promise.all(
                (subprocessos || []).map(async (subprocesso) => {
                  const { data: servicos } = await supabase
                    .from('servicos')
                    .select('id, produto, status')
                    .eq('subprocesso_id', subprocesso.id)
                    .eq('ativo', true);

                  return {
                    ...subprocesso,
                    servicos: servicos || []
                  };
                })
              );

              return {
                ...processo,
                subprocessos: subprocessosCompletos
              };
            })
          );

          // Calcular quantidade total de serviços para esta área
          const quantidadeServicos = processosCompletos.reduce((total, processo) => {
            return total + processo.subprocessos.reduce((subTotal, subprocesso) => {
              return subTotal + (subprocesso.servicos?.length || 0);
            }, 0);
          }, 0);

          return {
            ...area,
            processos: processosCompletos,
            quantidadeServicos
          };
        })
      );
      
      console.log('🏢 Areas loaded from Supabase:', areasWithProcessos.map(a => ({ id: a.id, nome: a.nome })));
      console.log('🔍 First area details:', areasWithProcessos[0] ? {
        id: areasWithProcessos[0].id,
        nome: areasWithProcessos[0].nome,
        processosCount: areasWithProcessos[0].processos?.length
      } : 'No areas found');
      return areasWithProcessos as AreaCompleta[];
    },
  });
};

export const useAreaById = (id: string) => {
  return useQuery({
    queryKey: ['area', id],
    queryFn: async () => {
      // Buscar área
      const { data: area, error: areaError } = await supabase
        .from('areas')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();
      
      if (areaError) throw areaError;

      // Buscar processos da área
      const { data: processos } = await supabase
        .from('processos')
        .select('id, nome, descricao')
        .eq('area_id', id)
        .eq('ativo', true)
        .order('nome');

      // Buscar subprocessos e serviços para cada processo
      const processosCompletos = await Promise.all(
        (processos || []).map(async (processo) => {
          const { data: subprocessos } = await supabase
            .from('subprocessos')
            .select('id, nome, descricao')
            .eq('processo_id', processo.id)
            .eq('ativo', true)
            .order('nome');

          // Buscar serviços para cada subprocesso
          const subprocessosCompletos = await Promise.all(
            (subprocessos || []).map(async (subprocesso) => {
              const { data: servicos } = await supabase
                .from('servicos')
                .select('id, produto, status, tempo_medio, sla, demanda_rotina, o_que_e, quem_pode_utilizar, requisitos_operacionais, observacoes')
                .eq('subprocesso_id', subprocesso.id)
                .eq('ativo', true)
                // Remover filtro de status para contar todos os serviços
                // .eq('status', 'ativo')
                .order('produto');

              return {
                ...subprocesso,
                servicos: servicos || []
              };
            })
          );

          return {
            ...processo,
            subprocessos: subprocessosCompletos
          };
        })
      );

      // Calcular quantidade total de serviços
      const quantidadeServicos = processosCompletos.reduce((total, processo) => {
        return total + processo.subprocessos.reduce((subTotal, subprocesso) => {
          return subTotal + (subprocesso.servicos?.length || 0);
        }, 0);
      }, 0);
      
      return {
        ...area,
        processos: processosCompletos,
        quantidadeServicos
      } as AreaCompleta;
    },
    enabled: !!id,
  });
};

export const useProcessos = (areaId?: string) => {
  return useQuery({
    queryKey: ['processos', areaId],
    queryFn: async () => {
      let query = supabase
        .from('processos')
        .select(`
          id,
          nome,
          descricao,
          area:areas(id, nome)
        `)
        .eq('ativo', true);

      if (areaId) {
        query = query.eq('area_id', areaId);
      }

      const { data, error } = await query.order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !areaId || !!areaId,
  });
};

export const useSubprocessos = (processoId?: string) => {
  return useQuery({
    queryKey: ['subprocessos', processoId],
    queryFn: async () => {
      let query = supabase
        .from('subprocessos')
        .select(`
          id,
          nome,
          descricao,
          processo:processos(id, nome, area:areas(id, nome))
        `)
        .eq('ativo', true);

      if (processoId) {
        query = query.eq('processo_id', processoId);
      }

      const { data, error } = await query.order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: !processoId || !!processoId,
  });
};