import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings, useUpdateSettings } from "@/hooks/useSettings";
import { 
  Settings, 
  Bell, 
  Eye, 
  Palette, 
  Globe, 
  Shield, 
  Key, 
  Save,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

export default function Configuracoes() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Buscar configurações do usuário
  const { data: settings, isLoading: isLoadingSettings } = useUserSettings(user?.id || '');
  const updateSettingsMutation = useUpdateSettings();

  // Estados locais para configurações
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    suggestions: true,
    updates: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public' as const,
    showEmail: true,
    showActivity: false
  });

  const [appearance, setAppearance] = useState({
    theme: 'system' as const,
    compactMode: false,
    showAnimations: true,
    sidebarPinned: true
  });

  const [language, setLanguage] = useState('pt-BR');

  // Atualizar estados locais quando as configurações forem carregadas
  React.useEffect(() => {
    if (settings) {
      setNotifications(settings.notifications);
      setPrivacy(settings.privacy);
      setAppearance(settings.appearance);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleSaveSettings = () => {
    if (!user?.id) return;

    updateSettingsMutation.mutate({
      userId: user.id,
      settings: {
        notifications,
        privacy,
        appearance,
        language
      }
    });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Acesso Negado
              </h3>
              <p className="text-muted-foreground text-center">
                Faça login para acessar as configurações.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas preferências e configurações do sistema</p>
            </div>
          </div>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificações</span>
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por e-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Atualizações de sugestões</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre o status das suas sugestões
                  </p>
                </div>
                <Switch
                  checked={notifications.suggestions}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, suggestions: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Atualizações do sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre novas funcionalidades
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, updates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacidade</span>
              </CardTitle>
              <CardDescription>
                Controle como suas informações são exibidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibilidade do perfil</Label>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) => 
                    setPrivacy({ ...privacy, profileVisibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                    <SelectItem value="friends">Apenas amigos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mostrar e-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que outros usuários vejam seu e-mail
                  </p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, showEmail: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mostrar atividade</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibe sua atividade recente no sistema
                  </p>
                </div>
                <Switch
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => 
                    setPrivacy({ ...privacy, showActivity: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Aparência</span>
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(value) => 
                    setAppearance({ ...appearance, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Claro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Escuro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>Sistema</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduz o espaçamento entre elementos
                  </p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => 
                    setAppearance({ ...appearance, compactMode: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Animações</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita animações e transições
                  </p>
                </div>
                <Switch
                  checked={appearance.showAnimations}
                  onCheckedChange={(checked) => 
                    setAppearance({ ...appearance, showAnimations: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Menu lateral fixo</Label>
                  <p className="text-sm text-muted-foreground">
                    Mantém o menu lateral sempre visível
                  </p>
                </div>
                <Switch
                  checked={appearance.sidebarPinned}
                  onCheckedChange={(checked) => 
                    setAppearance({ ...appearance, sidebarPinned: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Idioma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Idioma</span>
              </CardTitle>
              <CardDescription>
                Escolha o idioma de sua preferência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Idioma do sistema</Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">
                    Atualize sua senha regularmente
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Autenticação de dois fatores</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sessões ativas</p>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas sessões ativas
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver sessões
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              Restaurar padrões
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending || isLoadingSettings}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar configurações'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
} 