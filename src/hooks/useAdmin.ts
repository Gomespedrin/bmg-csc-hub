import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook para verificar se o usuário é administrador
export const useIsAdmin = () => {
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      try {
        // Primeiro, tentar buscar apenas perfil
        const { data, error } = await supabase
          .from('profiles')
          .select('perfil')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Perfil não encontrado - usuário não tem perfil ainda
            console.log('Perfil não encontrado para o usuário:', user.id);
            return false;
          }
          console.error('Erro ao verificar perfil:', error);
          return false;
        }

        // Verificar se é administrador baseado no perfil
        const perfil = data?.perfil;
        const isAdmin = perfil === 'administrador' || perfil === 'superadministrador';

        console.log('Verificação de admin:', { user_id: user.id, perfil, isAdmin });
        
        return isAdmin;
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
        return false;
      }
    },
    enabled: true, // Sempre executar quando o hook for chamado
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1, // Tentar apenas uma vez
    retryDelay: 1000, // Esperar 1 segundo antes de tentar novamente
  });
};

// Hooks para Áreas
export const useAdminAreas = () => {
  return useQuery({
    queryKey: ['admin-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (area: { nome: string; icone?: string; descricao?: string }) => {
      const { data, error } = await supabase
        .from('areas')
        .insert(area)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({
        title: "Área criada",
        description: "A área foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar área. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...area }: { id: string; nome?: string; icone?: string; descricao?: string; ativo?: boolean }) => {
      const { data, error } = await supabase
        .from('areas')
        .update(area)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({
        title: "Área atualizada",
        description: "A área foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar área. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteArea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-areas'] });
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast({
        title: "Área excluída",
        description: "A área foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir área. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

// Hooks para Processos
export const useAdminProcessos = () => {
  return useQuery({
    queryKey: ['admin-processos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          *,
          area:areas(id, nome)
        `)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProcesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (processo: { nome: string; descricao?: string; area_id: string }) => {
      const { data, error } = await supabase
        .from('processos')
        .insert(processo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-processos'] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      toast({
        title: "Processo criado",
        description: "O processo foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar processo. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateProcesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...processo }: { id: string; nome?: string; descricao?: string; area_id?: string; ativo?: boolean }) => {
      const { data, error } = await supabase
        .from('processos')
        .update(processo)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-processos'] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      toast({
        title: "Processo atualizado",
        description: "O processo foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar processo. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteProcesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-processos'] });
      queryClient.invalidateQueries({ queryKey: ['processos'] });
      toast({
        title: "Processo excluído",
        description: "O processo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir processo. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

// Hooks para Subprocessos
export const useAdminSubprocessos = () => {
  return useQuery({
    queryKey: ['admin-subprocessos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subprocessos')
        .select(`
          *,
          processo:processos(
            id,
            nome,
            area:areas(id, nome)
          )
        `)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSubprocesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (subprocesso: { nome: string; descricao?: string; processo_id: string }) => {
      const { data, error } = await supabase
        .from('subprocessos')
        .insert(subprocesso)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subprocessos'] });
      queryClient.invalidateQueries({ queryKey: ['subprocessos'] });
      toast({
        title: "Subprocesso criado",
        description: "O subprocesso foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar subprocesso. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateSubprocesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...subprocesso }: { id: string; nome?: string; descricao?: string; processo_id?: string; ativo?: boolean }) => {
      const { data, error } = await supabase
        .from('subprocessos')
        .update(subprocesso)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subprocessos'] });
      queryClient.invalidateQueries({ queryKey: ['subprocessos'] });
      toast({
        title: "Subprocesso atualizado",
        description: "O subprocesso foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar subprocesso. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteSubprocesso = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subprocessos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subprocessos'] });
      queryClient.invalidateQueries({ queryKey: ['subprocessos'] });
      toast({
        title: "Subprocesso excluído",
        description: "O subprocesso foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir subprocesso. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

// Hooks para Serviços
export const useAdminServicos = () => {
  return useQuery({
    queryKey: ['admin-servicos'],
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
              area:areas(id, nome)
            )
          )
        `)
        .order('produto');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateServico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (servico: {
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
      subprocesso_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('servicos')
        .insert({
          ...servico,
          created_by: user.id,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar serviço. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateServico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...servico }: {
      id: string;
      produto?: string;
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
      subprocesso_id?: string;
      status?: string;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteServico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-servicos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir serviço. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
}; 

// Hooks para Usuários
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (user: {
      email: string;
      nome: string;
      perfil: string;
      telefone?: string;
      departamento?: string;
    }) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'temp123456', // Senha temporária
        email_confirm: true,
        user_metadata: {
          nome: user.nome,
          perfil: user.perfil,
          telefone: user.telefone,
          departamento: user.departamento,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso. Uma senha temporária foi enviada por email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...user }: {
      id: string;
      nome?: string;
      perfil?: string;
      telefone?: string;
      departamento?: string;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(user)
        .eq('user_id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário atualizado",
        description: "O usuário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

// Hooks para FAQ
export const useAdminFAQ = () => {
  return useQuery({
    queryKey: ['admin-faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('ordem, categoria');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (faq: {
      pergunta: string;
      resposta: string;
      categoria: string;
      tags?: string;
      ordem?: number;
    }) => {
      const { data, error } = await supabase
        .from('faq')
        .insert(faq)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] });
      toast({
        title: "FAQ criado",
        description: "A pergunta frequente foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar FAQ. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...faq }: {
      id: string;
      pergunta?: string;
      resposta?: string;
      categoria?: string;
      tags?: string;
      ordem?: number;
      ativo?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('faq')
        .update(faq)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] });
      toast({
        title: "FAQ atualizado",
        description: "A pergunta frequente foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar FAQ. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faq')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] });
      toast({
        title: "FAQ excluído",
        description: "A pergunta frequente foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir FAQ. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
};

// Hooks para Auditoria
export const useAdminAuditoria = () => {
  return useQuery({
    queryKey: ['admin-auditoria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditoria')
        .select(`
          *,
          usuario:profiles(nome, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
};

// Hooks para Configurações
export const useAdminConfiguracoes = () => {
  return useQuery({
    queryKey: ['admin-configuracoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateConfiguracoes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (configuracoes: {
      nome_portal?: string;
      email_contato?: string;
      notificacoes_email?: boolean;
      notificacoes_push?: boolean;
      notificacoes_sms?: boolean;
      frequencia_backup?: string;
      retencao_logs?: number;
    }) => {
      const { data, error } = await supabase
        .from('configuracoes')
        .upsert(configuracoes)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-configuracoes'] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações. Verifique se você está logado como administrador.",
        variant: "destructive"
      });
    },
  });
}; 