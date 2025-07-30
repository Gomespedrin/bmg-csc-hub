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
      // Buscar todos os serviços ativos
      const { data: servicos, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('ativo', true);
      
      if (error) throw error;

      // Buscar informações de subprocesso, processo e área para cada serviço
      const servicosCompletos = await Promise.all(
        (servicos || []).map(async (servico) => {
          // Buscar subprocesso
          const { data: subprocesso } = await supabase
            .from('subprocessos')
            .select('id, nome, processo_id')
            .eq('id', servico.subprocesso_id)
            .eq('ativo', true)
            .single();

          if (!subprocesso) return null;

          // Buscar processo
          const { data: processo } = await supabase
            .from('processos')
            .select('id, nome, area_id')
            .eq('id', subprocesso.processo_id)
            .eq('ativo', true)
            .single();

          if (!processo) return null;

          // Buscar área
          const { data: area } = await supabase
            .from('areas')
            .select('id, nome, icone')
            .eq('id', processo.area_id)
            .eq('ativo', true)
            .single();

          if (!area) return null;

          return {
            ...servico,
            subprocesso: {
              ...subprocesso,
              processo: {
                ...processo,
                area
              }
            }
          };
        })
      );

      let filteredServicos = servicosCompletos.filter(Boolean) as Servico[];

      // Debug logging
      console.log('🔍 Filtering services with filters:', filters);
      console.log('📊 Total services before filtering:', filteredServicos.length);

      // Aplicar filtros
      if (filters?.areas?.length > 0) {
        console.log('🏢 Filtering by areas:', filters.areas);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          filters.areas.includes(servico.subprocesso.processo.area.nome)
        );
        console.log(`📈 Areas filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      if (filters?.processos?.length > 0) {
        console.log('⚙️ Filtering by processos:', filters.processos);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          filters.processos.includes(servico.subprocesso.processo.nome)
        );
        console.log(`📈 Processos filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      if (filters?.subprocessos?.length > 0) {
        console.log('🔧 Filtering by subprocessos:', filters.subprocessos);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          filters.subprocessos.includes(servico.subprocesso.nome)
        );
        console.log(`📈 Subprocessos filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      if (filters?.produto) {
        console.log('📋 Filtering by produto:', filters.produto);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          servico.produto.toLowerCase().includes(filters.produto.toLowerCase())
        );
        console.log(`📈 Produto filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      if (filters?.demandaRotina && filters.demandaRotina !== "todos") {
        console.log('🔄 Filtering by demandaRotina:', filters.demandaRotina);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          servico.demanda_rotina === filters.demandaRotina
        );
        console.log(`📈 DemandaRotina filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      if (filters?.status?.length > 0) {
        console.log('📊 Filtering by status:', filters.status);
        const beforeCount = filteredServicos.length;
        filteredServicos = filteredServicos.filter(servico => 
          filters.status.includes(servico.status)
        );
        console.log(`📈 Status filter: ${beforeCount} -> ${filteredServicos.length} services`);
      }

      console.log('✅ Final filtered services count:', filteredServicos.length);
      return filteredServicos;
    },
  });
};

export const useServicoById = (id: string) => {
  return useQuery({
    queryKey: ['servico', id],
    queryFn: async () => {
      const { data: servico, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Buscar subprocesso
      const { data: subprocesso } = await supabase
        .from('subprocessos')
        .select('id, nome, processo_id')
        .eq('id', servico.subprocesso_id)
        .eq('ativo', true)
        .single();

      if (!subprocesso) throw new Error('Subprocesso não encontrado');

      // Buscar processo
      const { data: processo } = await supabase
        .from('processos')
        .select('id, nome, area_id')
        .eq('id', subprocesso.processo_id)
        .eq('ativo', true)
        .single();

      if (!processo) throw new Error('Processo não encontrado');

      // Buscar área
      const { data: area } = await supabase
        .from('areas')
        .select('id, nome, icone')
        .eq('id', processo.area_id)
        .eq('ativo', true)
        .single();

      if (!area) throw new Error('Área não encontrada');

      return {
        ...servico,
        subprocesso: {
          ...subprocesso,
          processo: {
            ...processo,
            area
          }
        }
      } as Servico;
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