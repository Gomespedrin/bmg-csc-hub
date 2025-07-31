import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useMinhasSugestoes } from "@/hooks/useSugestoes";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function Perfil() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: profile?.nome || '',
    email: profile?.email || '',
  });

  // Buscar sugestões do usuário para estatísticas
  const { data: minhasSugestoes } = useMinhasSugestoes();

  // Calcular estatísticas reais
  const estatisticas = {
    enviadas: minhasSugestoes?.length || 0,
    aprovadas: minhasSugestoes?.filter(s => s.status === 'aprovada').length || 0,
    pendentes: minhasSugestoes?.filter(s => s.status === 'pendente').length || 0,
    rejeitadas: minhasSugestoes?.filter(s => s.status === 'rejeitada').length || 0
  };

  const updateProfile = useMutation({
    mutationFn: async (data: { nome: string; email: string }) => {
      const { data: result, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      setIsEditing(false);
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nome: profile?.nome || '',
      email: profile?.email || '',
    });
  };

  const getPerfilBadge = (perfil: string) => {
    const variants = {
      'visitante': 'secondary',
      'colaborador': 'default',
      'administrador': 'destructive',
      'superadministrador': 'destructive'
    } as const;

    return (
      <Badge variant={variants[perfil as keyof typeof variants] || 'secondary'}>
        {perfil}
      </Badge>
    );
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Perfil não encontrado
              </h3>
              <p className="text-muted-foreground text-center">
                Faça login para visualizar seu perfil.
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {profile.nome ? profile.nome.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
            </div>
          </div>

          {/* Informações do Perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                  <CardDescription>
                    Suas informações básicas no sistema
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm text-muted-foreground">{profile.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">E-mail</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Informações da Conta</span>
              </CardTitle>
              <CardDescription>
                Detalhes sobre sua conta e permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Perfil</p>
                    <div className="mt-1">
                      {getPerfilBadge(profile.perfil)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membro desde</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Atividade</span>
              </CardTitle>
              <CardDescription>
                Resumo da sua atividade no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.enviadas}</p>
                  <p className="text-xs text-blue-700 font-medium">Sugestões Enviadas</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.aprovadas}</p>
                  <p className="text-xs text-green-700 font-medium">Aprovadas</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{estatisticas.pendentes}</p>
                  <p className="text-xs text-orange-700 font-medium">Pendentes</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.rejeitadas}</p>
                  <p className="text-xs text-red-700 font-medium">Rejeitadas</p>
                </div>
              </div>
              
              {estatisticas.enviadas > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de aprovação</span>
                    <span className="font-medium">
                      {Math.round((estatisticas.aprovadas / estatisticas.enviadas) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(estatisticas.aprovadas / estatisticas.enviadas) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 