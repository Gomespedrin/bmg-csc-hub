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
      modo?: string;
      dados_atuais?: any;
    }) => {
      console.log("useCreateSugestao - Iniciando mutation");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log("useCreateSugestao - Usuário autenticado:", user.id);
      console.log("useCreateSugestao - Dados da sugestão:", sugestao);

      const { data, error } = await supabase
        .from('sugestoes')
        .insert({
          ...sugestao,
          modo: sugestao.modo || 'criacao', // Garantir que modo não seja null
          dados_atuais: sugestao.dados_atuais || {}, // Garantir que dados_atuais não seja null
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("useCreateSugestao - Erro do Supabase:", error);
        throw error;
      }
      
      console.log("useCreateSugestao - Sugestão criada com sucesso:", data);
      return data;
    },
    onSuccess: () => {
      console.log("useCreateSugestao - onSuccess executado");
      queryClient.invalidateQueries({ queryKey: ['sugestoes'] });
    },
    onError: (error) => {
      console.error("useCreateSugestao - onError:", error);
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

      // Se a sugestão foi aprovada, processar automaticamente
      if (status === 'aprovada') {
        // Buscar a sugestão para obter os dados
        const { data: sugestao } = await supabase
          .from('sugestoes')
          .select('*')
          .eq('id', id)
          .single();

        if (sugestao) {
          if (sugestao.tipo === 'novo') {
            // Criar novo serviço
            const { data: servico, error: servicoError } = await supabase
              .from('servicos')
              .insert({
                produto: sugestao.dados_sugeridos.produto,
                o_que_e: sugestao.dados_sugeridos.oQueE,
                quem_pode_utilizar: sugestao.dados_sugeridos.quemPodeUtilizar,
                tempo_medio: sugestao.dados_sugeridos.tempoMedio,
                unidade_medida: sugestao.dados_sugeridos.unidadeMedida,
                sla: sugestao.dados_sugeridos.sla,
                sli: sugestao.dados_sugeridos.sli,
                demanda_rotina: sugestao.dados_sugeridos.demandaRotina,
                requisitos_operacionais: sugestao.dados_sugeridos.requisitosOperacionais,
                observacoes: sugestao.dados_sugeridos.observacoes,
                subprocesso_id: sugestao.dados_sugeridos.subprocesso_id,
                created_by: user.id,
                status: 'ativo'
              })
              .select()
              .single();

            if (servicoError) throw servicoError;
          } else if (sugestao.tipo === 'edicao' && sugestao.servico_id) {
            // Atualizar serviço existente
            const { error: servicoError } = await supabase
              .from('servicos')
              .update({
                produto: sugestao.dados_sugeridos.produto,
                o_que_e: sugestao.dados_sugeridos.oQueE,
                quem_pode_utilizar: sugestao.dados_sugeridos.quemPodeUtilizar,
                tempo_medio: sugestao.dados_sugeridos.tempoMedio,
                unidade_medida: sugestao.dados_sugeridos.unidadeMedida,
                sla: sugestao.dados_sugeridos.sla,
                sli: sugestao.dados_sugeridos.sli,
                demanda_rotina: sugestao.dados_sugeridos.demandaRotina,
                requisitos_operacionais: sugestao.dados_sugeridos.requisitosOperacionais,
                observacoes: sugestao.dados_sugeridos.observacoes,
                updated_at: new Date().toISOString()
              })
              .eq('id', sugestao.servico_id);

            if (servicoError) throw servicoError;
          }
        }
      }

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
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
    },
  });
};