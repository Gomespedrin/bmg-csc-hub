import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useServicosPopulares(limit: number = 6) {
  return useQuery({
    queryKey: ["servicos-populares", limit],
    queryFn: async () => {
      console.log("🔍 Fetching popular services...");
      
      // Por enquanto, vamos buscar serviços ativos ordenados por versão (mais recentes primeiro)
      // Em uma implementação real, isso seria baseado em métricas de acesso
      const { data, error } = await supabase
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
          versao,
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
        .eq('ativo', true)
        .eq('status', 'ativo')
        .order('versao', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Formatar dados para o componente
      const formattedServicos = data.map((servico: any) => ({
        id: servico.id,
        produto: servico.produto,
        subprocesso: servico.subprocesso.nome,
        processo: servico.subprocesso.processo.nome,
        area: servico.subprocesso.processo.area.nome,
        tempoMedio: servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : '1 dia',
        sla: servico.sla ? `${servico.sla} horas` : '24 horas',
        status: (servico.status === 'ativo' ? 'Ativo' : 'Inativo') as "Ativo" | "Inativo",
        demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda',
        oQueE: servico.o_que_e,
        observacoes: servico.observacoes,
        versao: servico.versao
      }));

      return {
        services: formattedServicos,
        totalItems: formattedServicos.length
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
} 