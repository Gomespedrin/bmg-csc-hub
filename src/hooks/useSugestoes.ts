import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sugestao {
  id: string;
  tipo: string;
  status: string;
  criado_por: string;
  aprovado_por?: string;
  servico_id?: string;
  dados_sugeridos: any; // Manter como any para compatibilidade
  justificativa?: string;
  comentario_admin?: string;
  created_at: string;
  updated_at: string;
}

// Interface para tipagem interna (não usada no retorno do banco)
export interface DadosSugeridos {
  modo: 'criacao' | 'edicao';
  escopo: 'area' | 'processo' | 'subprocesso' | 'servico';
  area_id?: string;
  processo_id?: string;
  subprocesso_id?: string;
  servico_id?: string;
  nome: string;
  descricao: string;
  area?: string;
  processo?: string;
  subprocesso?: string;
  servico?: string;
  produto?: string;
  oQueE?: string;
  dados_atuais?: any;
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
      
      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }
      
      return data as Sugestao[];
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

export const useMinhasSugestoes = () => {
  return useQuery({
    queryKey: ['minhas-sugestoes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sugestoes')
        .select('*')
        .eq('criado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar minhas sugestões:', error);
        throw error;
      }
      
      return data as Sugestao[];
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('sugestoes')
        .insert({
          ...sugestao,
          modo: sugestao.modo || 'criacao',
          dados_atuais: sugestao.dados_atuais || {},
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar sugestão:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sugestoes'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-sugestoes'] });
    },
    onError: (error) => {
      console.error("Erro na criação de sugestão:", error);
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
        const { data: sugestao, error: sugestaoError } = await supabase
          .from('sugestoes')
          .select('*')
          .eq('id', id)
          .single();

        if (sugestaoError) throw sugestaoError;
        if (!sugestao) throw new Error('Sugestão não encontrada');

        const dadosSugeridos = sugestao.dados_sugeridos as any;
        const modo = dadosSugeridos.modo || 'criacao';
        const escopo = dadosSugeridos.escopo;

        // Validar se temos os dados necessários
        if (!dadosSugeridos) {
          throw new Error('Dados da sugestão não encontrados');
        }

        // Validar se temos o escopo
        if (!escopo) {
          throw new Error('Escopo da sugestão não definido');
        }

        if (modo === 'criacao') {
          // Lógica para criação de novos itens
          if (escopo === 'area') {
            // Criar nova área
            
            if (!dadosSugeridos.nome) {
              throw new Error('Nome da área é obrigatório');
            }

            const { data: area, error: areaError } = await supabase
              .from('areas')
              .insert({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao || 'Descrição não fornecida',
                ativo: true
              })
              .select()
              .single();

            if (areaError) {
              console.error('Erro ao criar área:', areaError);
              throw new Error(`Erro ao criar área: ${areaError.message}`);
            }

          } else if (escopo === 'processo') {
            // Criar novo processo
            
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do processo é obrigatório');
            }
            if (!dadosSugeridos.area_id) {
              throw new Error('É necessário selecionar uma área para criar um processo');
            }

            const { data: processo, error: processoError } = await supabase
              .from('processos')
              .insert({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao || 'Descrição não fornecida',
                area_id: dadosSugeridos.area_id,
                ativo: true
              })
              .select()
              .single();

            if (processoError) {
              console.error('Erro ao criar processo:', processoError);
              throw new Error(`Erro ao criar processo: ${processoError.message}`);
            }

          } else if (escopo === 'subprocesso') {
            // Criar novo subprocesso
            
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do subprocesso é obrigatório');
            }
            if (!dadosSugeridos.area_id) {
              throw new Error('É necessário selecionar uma área para criar um subprocesso');
            }
            if (!dadosSugeridos.processo_id) {
              throw new Error('É necessário selecionar um processo para criar um subprocesso');
            }

            const { data: subprocesso, error: subprocessoError } = await supabase
              .from('subprocessos')
              .insert({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao || 'Descrição não fornecida',
                processo_id: dadosSugeridos.processo_id,
                ativo: true
              })
              .select()
              .single();

            if (subprocessoError) {
              console.error('Erro ao criar subprocesso:', subprocessoError);
              throw new Error(`Erro ao criar subprocesso: ${subprocessoError.message}`);
            }

          } else if (escopo === 'servico') {
            // Criar novo serviço
            
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do serviço é obrigatório');
            }
            if (!dadosSugeridos.area_id) {
              throw new Error('É necessário selecionar uma área para criar um serviço');
            }
            if (!dadosSugeridos.processo_id) {
              throw new Error('É necessário selecionar um processo para criar um serviço');
            }
            if (!dadosSugeridos.subprocesso_id) {
              throw new Error('É necessário selecionar um subprocesso para criar um serviço');
            }

            const { data: servico, error: servicoError } = await supabase
              .from('servicos')
              .insert({
                produto: dadosSugeridos.nome,
                o_que_e: dadosSugeridos.descricao || 'Descrição não fornecida',
                quem_pode_utilizar: dadosSugeridos.quemPodeUtilizar || 'Não especificado',
                tempo_medio: dadosSugeridos.tempoMedio || 0,
                unidade_medida: dadosSugeridos.unidadeMedida || 'dias',
                sla: dadosSugeridos.sla || 'Não especificado',
                sli: dadosSugeridos.sli || 'Não especificado',
                demanda_rotina: dadosSugeridos.demandaRotina || 'Demanda',
                requisitos_operacionais: dadosSugeridos.requisitosOperacionais || 'Não especificado',
                observacoes: dadosSugeridos.observacoes || '',
                subprocesso_id: dadosSugeridos.subprocesso_id,
                created_by: user.id,
                status: 'ativo',
                ativo: true
              })
              .select()
              .single();

            if (servicoError) {
              console.error('Erro ao criar serviço:', servicoError);
              throw new Error(`Erro ao criar serviço: ${servicoError.message}`);
            }

          }

        } else if (modo === 'edicao') {
          // Lógica para edição de itens existentes
          if (escopo === 'area') {
            if (!dadosSugeridos.area_id) {
              throw new Error('É necessário selecionar uma área para edição');
            }
            if (!dadosSugeridos.nome) {
              throw new Error('Nome da área é obrigatório');
            }

            const { error: areaError } = await supabase
              .from('areas')
              .update({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao,
                updated_at: new Date().toISOString()
              })
              .eq('id', dadosSugeridos.area_id);

            if (areaError) {
              console.error('Erro ao atualizar área:', areaError);
              throw new Error(`Erro ao atualizar área: ${areaError.message}`);
            }

          } else if (escopo === 'processo') {
            if (!dadosSugeridos.processo_id) {
              throw new Error('É necessário selecionar um processo para edição');
            }
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do processo é obrigatório');
            }

            const { error: processoError } = await supabase
              .from('processos')
              .update({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao,
                updated_at: new Date().toISOString()
              })
              .eq('id', dadosSugeridos.processo_id);

            if (processoError) {
              console.error('Erro ao atualizar processo:', processoError);
              throw new Error(`Erro ao atualizar processo: ${processoError.message}`);
            }

          } else if (escopo === 'subprocesso') {
            if (!dadosSugeridos.subprocesso_id) {
              throw new Error('É necessário selecionar um subprocesso para edição');
            }
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do subprocesso é obrigatório');
            }

            const { error: subprocessoError } = await supabase
              .from('subprocessos')
              .update({
                nome: dadosSugeridos.nome,
                descricao: dadosSugeridos.descricao,
                updated_at: new Date().toISOString()
              })
              .eq('id', dadosSugeridos.subprocesso_id);

            if (subprocessoError) {
              console.error('Erro ao atualizar subprocesso:', subprocessoError);
              throw new Error(`Erro ao atualizar subprocesso: ${subprocessoError.message}`);
            }

          } else if (escopo === 'servico') {
            if (!sugestao.servico_id) {
              throw new Error('É necessário selecionar um serviço para edição');
            }
            if (!dadosSugeridos.nome) {
              throw new Error('Nome do serviço é obrigatório');
            }

            const { error: servicoError } = await supabase
              .from('servicos')
              .update({
                produto: dadosSugeridos.nome,
                o_que_e: dadosSugeridos.descricao,
                quem_pode_utilizar: dadosSugeridos.quemPodeUtilizar,
                tempo_medio: dadosSugeridos.tempoMedio,
                unidade_medida: dadosSugeridos.unidadeMedida,
                sla: dadosSugeridos.sla,
                sli: dadosSugeridos.sli,
                demanda_rotina: dadosSugeridos.demandaRotina,
                requisitos_operacionais: dadosSugeridos.requisitosOperacionais,
                observacoes: dadosSugeridos.observacoes,
                updated_at: new Date().toISOString()
              })
              .eq('id', sugestao.servico_id);

            if (servicoError) {
              console.error('Erro ao atualizar serviço:', servicoError);
              throw new Error(`Erro ao atualizar serviço: ${servicoError.message}`);
            }
          }
        }
      }

      // Atualizar status da sugestão
      
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

      if (error) {
        console.error('Erro ao atualizar sugestão:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['sugestoes'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-sugestoes'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
    onError: (error) => {
      console.error('Erro na mutation useUpdateSugestao:', error);
    },
  });
};

export const useSugestoesError = () => {
  return useQuery({
    queryKey: ['sugestoes-error'],
    queryFn: async () => {
      throw new Error('Erro simulado para teste');
    },
    retry: false,
    enabled: false, // Só executa quando chamado explicitamente
  });
};