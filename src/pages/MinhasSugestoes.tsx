import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit
} from "lucide-react";
import { useSugestoes, useMinhasSugestoes } from "@/hooks/useSugestoes";
import { useAreas } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
import { useToast } from "@/hooks/use-toast";

export default function MinhasSugestoes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Hooks para dados
  const { data: sugestoes, isLoading } = useMinhasSugestoes();
  const { data: areas } = useAreas();
  const { data: servicos } = useServicos({ showAll: true });

  // Filtrar sugestões do usuário atual
  const mySugestoes = sugestoes?.filter(sugestao => {
    const matchesSearch = sugestao.dados_sugeridos.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sugestao.dados_sugeridos.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sugestao.justificativa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || sugestao.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateSugestao = () => {
    navigate('/sugestoes/nova');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      'aprovada': { label: 'Aprovada', variant: 'default' as const, icon: CheckCircle },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const, icon: XCircle }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReenviarSugestao = (sugestao: any) => {
    // Navegar para a página de nova sugestão com os dados preenchidos
    const dadosSugeridos = sugestao.dados_sugeridos;
    const queryParams = new URLSearchParams({
      modo: dadosSugeridos.modo || 'criacao', // Preservar o modo original
      escopo: dadosSugeridos.escopo || 'servico',
      area_id: dadosSugeridos.area_id || '',
      processo_id: dadosSugeridos.processo_id || '',
      subprocesso_id: dadosSugeridos.subprocesso_id || '',
      servico_id: dadosSugeridos.servico_id || '',
      nome: dadosSugeridos.nome || dadosSugeridos.produto || '',
      descricao: dadosSugeridos.descricao || dadosSugeridos.oQueE || '',
      justificativa: sugestao.justificativa || '', // Usar a justificativa original, não o comentário do admin
      reenviar: 'true'
    });
    
    navigate(`/sugestoes/nova?${queryParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
              <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Minhas Sugestões
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas sugestões enviadas para o catálogo de serviços
            </p>
          </div>
          <Button onClick={handleCreateSugestao}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Sugestão
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar sugestões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="rejeitada">Rejeitada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Sugestões */}
        <div className="grid gap-6">
          {mySugestoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma sugestão encontrada
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== 'todos' 
                    ? 'Não há sugestões que correspondam aos filtros aplicados.'
                    : 'Você ainda não enviou nenhuma sugestão. Clique em "Nova Sugestão" para começar.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            mySugestoes.map((sugestao) => (
              <Card key={sugestao.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {sugestao.dados_sugeridos.produto}
                      </CardTitle>
                      <CardDescription>
                        {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria de Serviço'} • 
                        Enviado em {formatDate(sugestao.created_at)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(sugestao.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Área</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.area || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Processo</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.processo || 'Não informado'}</p>
                    </div>
                  </div>

                  {sugestao.dados_sugeridos.subprocesso && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Subprocesso</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.subprocesso}</p>
                    </div>
                  )}

                  {sugestao.dados_sugeridos.servico && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Serviço</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.servico}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p className="text-sm mt-1">{sugestao.dados_sugeridos.oQueE || sugestao.dados_sugeridos.descricao || 'Não informado'}</p>
                  </div>

                  {sugestao.justificativa && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Justificativa</Label>
                      <p className="text-sm mt-1">{sugestao.justificativa}</p>
                    </div>
                  )}

                  {sugestao.comentario_admin && (
                    <div className="bg-muted p-3 rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Comentário do Admin</Label>
                      <p className="text-sm mt-1">{sugestao.comentario_admin}</p>
                    </div>
                  )}

                  {sugestao.status === 'rejeitada' && (
                    <>
                      <Separator />
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReenviarSugestao(sugestao)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Reenviar Sugestão
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
} 