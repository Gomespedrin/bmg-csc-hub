import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from 'react';

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
  sistema_existente?: string;
  status_automatizacao?: string;
  data_ultima_validacao?: string;
  status_validacao?: string;
  link_solicitacao?: string;
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

interface FilterOptions {
  areas?: string[];
  processos?: string[];
  subprocessos?: string[];
  produto?: string;
  demandaRotina?: string;
  status?: string[];
  busca?: string;
  page?: number;
  pageSize?: number;
  showAll?: boolean; // Nova opção para mostrar todos os serviços
}

export function useServicos(filters: FilterOptions = {}) {
  const {
    areas = [],
    processos = [],
    subprocessos = [],
    produto = "",
    demandaRotina = "todos",
    status = [],
    busca = "",
    page = 1,
    pageSize = 20,
    showAll = true
  } = filters;

  // Criar uma chave estável para o React Query
  const stableFilters = useMemo(() => ({
    areas: areas.sort(),
    processos: processos.sort(),
    subprocessos: subprocessos.sort(),
    produto,
    demandaRotina,
    status: status.sort(),
    busca,
    page,
    pageSize,
    showAll
  }), [areas, processos, subprocessos, produto, demandaRotina, status, busca, page, pageSize, showAll]);

  return useQuery({
    queryKey: ["servicos", stableFilters],
    queryFn: async () => {
      console.log("🔍 Fetching services with filters:", stableFilters);
      
      let query = supabase
        .from("servicos")
        .select(`
          id,
          produto,
          tempo_medio,
          sla,
          status,
          demanda_rotina,
          o_que_e,
          observacoes,
          sistema_existente,
          status_automatizacao,
          status_validacao,
          link_solicitacao,
          subprocesso:subprocessos!inner(
            id,
            nome,
            processo:processos!inner(
              id,
              nome,
              area:areas!inner(
                id,
                nome
              )
            )
          )
        `)
        .eq('ativo', true); // Filtrar apenas serviços ativos

      // Aplicar filtros no backend de forma otimizada
      if (areas.length > 0) {
        query = query.in("subprocesso.processo.area.nome", areas);
      }

      if (processos.length > 0) {
        query = query.in("subprocesso.processo.nome", processos);
      }

      if (subprocessos.length > 0) {
        query = query.in("subprocesso.nome", subprocessos);
      }

      if (produto) {
        query = query.ilike("produto", `%${produto}%`);
      }

      if (demandaRotina !== "todos") {
        query = query.eq("demanda_rotina", demandaRotina);
      }

      if (status.length > 0) {
        query = query.in("status", status);
      }

      if (busca) {
        // Busca simplificada - buscar apenas no produto por enquanto
        const sanitizedBusca = busca.trim().replace(/[\[\](){}^$+*?.|\\]/g, '\\$&');
        if (sanitizedBusca) {
          query = query.ilike("produto", `%${sanitizedBusca}%`);
        }
      }

      // Aplicar ordenação no backend
      query = query.order('produto', { ascending: true });

      // Aplicar paginação apenas se não estiver mostrando todos
      if (!showAll) {
        const startIndex = (page - 1) * pageSize;
        query = query.range(startIndex, startIndex + pageSize - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("❌ Error fetching services:", error);
        throw error;
      }

      console.log("📊 Total services fetched:", data?.length || 0);

      // Ordenação alfabética por hierarquia em memória (se necessário)
      const sortedData = (data || []).sort((a: any, b: any) => {
        // 1. Ordenar por Área
        const areaA = a.subprocesso?.processo?.area?.nome || "";
        const areaB = b.subprocesso?.processo?.area?.nome || "";
        if (areaA !== areaB) {
          return areaA.localeCompare(areaB, 'pt-BR');
        }

        // 2. Ordenar por Processo
        const processoA = a.subprocesso?.processo?.nome || "";
        const processoB = b.subprocesso?.processo?.nome || "";
        if (processoA !== processoB) {
          return processoA.localeCompare(processoB, 'pt-BR');
        }

        // 3. Ordenar por Subprocesso
        const subprocessoA = a.subprocesso?.nome || "";
        const subprocessoB = b.subprocesso?.nome || "";
        if (subprocessoA !== subprocessoB) {
          return subprocessoA.localeCompare(subprocessoB, 'pt-BR');
        }

        // 4. Ordenar por Produto
        const produtoA = a.produto || "";
        const produtoB = b.produto || "";
        return produtoA.localeCompare(produtoB, 'pt-BR');
      });

      const totalItems = showAll ? sortedData.length : (count || sortedData.length);
      const totalPages = showAll ? 1 : Math.ceil(totalItems / pageSize);

      console.log(`📄 Pagination: ${totalItems} total -> ${sortedData.length} items on page`);

      return {
        services: sortedData,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useServicoById(id: string) {
  return useQuery({
    queryKey: ["servico", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select(`
          *,
          subprocesso:subprocessos!inner(
            id,
            nome,
            processo:processos!inner(
              id,
              nome,
              area:areas!inner(
                id,
                nome
              )
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error fetching service:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

const getAreaIds = async (areaNames: string[]) => {
  const { data } = await supabase
    .from('areas')
    .select('id')
    .in('nome', areaNames);
  
  return data?.map(area => area.id) || [];
};