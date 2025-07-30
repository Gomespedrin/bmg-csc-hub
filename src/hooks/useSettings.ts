import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    profileVisibility: "public" | "private" | "friends";
    showEmail: boolean;
    showActivity: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    compactMode: boolean;
    showAnimations: boolean;
    sidebarPinned?: boolean;
  };
  language: string;
  created_at?: string;
  updated_at?: string;
}

const getDefaultSettings = (userId: string): UserSettings => ({
  user_id: userId,
  notifications: {
    email: true,
    push: false,
    suggestions: true,
    updates: false
  },
  privacy: {
    profileVisibility: "public",
    showEmail: true,
    showActivity: false
  },
  appearance: {
    theme: "system",
    compactMode: false,
    showAnimations: true,
    sidebarPinned: true
  },
  language: 'pt-BR'
});

export const useUserSettings = (userId: string) => {
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Por enquanto, usar localStorage até a tabela estar disponível
      const stored = localStorage.getItem(`user-settings-${userId}`);
      if (stored) {
        try {
          return JSON.parse(stored) as UserSettings;
        } catch (error) {
          console.error('Erro ao parsear configurações:', error);
        }
      }

      // Retornar configurações padrão
      const defaultSettings = getDefaultSettings(userId);
      localStorage.setItem(`user-settings-${userId}`, JSON.stringify(defaultSettings));
      return defaultSettings;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: Partial<UserSettings> }) => {
      // Por enquanto, salvar no localStorage
      const stored = localStorage.getItem(`user-settings-${userId}`);
      const currentSettings = stored ? JSON.parse(stored) : getDefaultSettings(userId);
      
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`user-settings-${userId}`, JSON.stringify(updatedSettings));
      return updatedSettings;
    },
    onSuccess: (data, variables) => {
      // Atualizar cache
      queryClient.setQueryData(['user-settings', variables.userId], data);
      queryClient.invalidateQueries({ queryKey: ['user-settings', variables.userId] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
    }
  });
}; 