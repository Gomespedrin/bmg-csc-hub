import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id?: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    suggestions: boolean;
    updates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showActivity: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    showAnimations: boolean;
  };
  language: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Retornar configurações padrão se não existirem
      if (!data) {
        return {
          user_id: userId,
          notifications: {
            email: true,
            push: false,
            suggestions: true,
            updates: false
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showActivity: false
          },
          appearance: {
            theme: 'system',
            compactMode: false,
            showAnimations: true
          },
          language: 'pt-BR'
        } as UserSettings;
      }

      return data as UserSettings;
    },
    enabled: !!userId,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: Partial<UserSettings> }) => {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', data.user_id] });
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive"
      });
    },
  });
}; 