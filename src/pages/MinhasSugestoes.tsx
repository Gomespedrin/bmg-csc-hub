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
  Edit,
  Building2,
  FolderOpen,
  Package,
  MessageSquare,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";
import { useSugestoes, useMinhasSugestoes } from "@/hooks/useSugestoes";
import { useAreas } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
import { useToast } from "@/hooks/use-toast";
import { ViewOptions, ViewMode } from "@/components/ui/view-options";

export default function MinhasSugestoes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      'pendente': { 
        label: 'Pendente', 
        variant: 'secondary' as const, 
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      'aprovada': { 
        label: 'Aprovada', 
        variant: 'default' as const, 
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      'rejeitada': { 
        label: 'Rejeitada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className={`flex items-center gap-1 ${statusInfo.className}`}>
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

  // Função para renderizar cards de sugestões baseado no modo de visualização
  const renderSugestaoCards = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mySugestoes.map((sugestao) => (
            <Card key={sugestao.id} className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                      {sugestao.dados_sugeridos.produto}
                    </CardTitle>
                  </div>
                  {getStatusBadge(sugestao.status)}
                </div>
                <CardDescription className="text-sm space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium text-secondary">
                      {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="text-muted-foreground">
                      {formatDate(sugestao.created_at)}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <Building2 className="h-3 w-3 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-blue-600 font-medium">Área</p>
                      <p className="text-blue-700 truncate">{sugestao.dados_sugeridos.area || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                    <FolderOpen className="h-3 w-3 text-orange-600" />
                    <div className="min-w-0">
                      <p className="text-orange-600 font-medium">Processo</p>
                      <p className="text-orange-700 truncate">{sugestao.dados_sugeridos.processo || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {showDetails && (
                  <div className="space-y-2 text-xs">
                    {sugestao.dados_sugeridos.subprocesso && (
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <Package className="h-3 w-3 text-green-600" />
                        <div className="min-w-0">
                          <p className="text-green-600 font-medium">Subprocesso</p>
                          <p className="text-green-700 truncate">{sugestao.dados_sugeridos.subprocesso}</p>
                        </div>
                      </div>
                    )}
                    {sugestao.justificativa && (
                      <div className="flex items-start space-x-2 p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="h-3 w-3 text-purple-600 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-purple-600 font-medium">Justificativa</p>
                          <p className="text-purple-700 line-clamp-2">{sugestao.justificativa}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-xs">
                    {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}
                  </Badge>

                  {sugestao.status === 'rejeitada' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => handleReenviarSugestao(sugestao)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Reenviar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="space-y-3">
          {mySugestoes.map((sugestao) => (
            <Card key={sugestao.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{sugestao.dados_sugeridos.produto}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {sugestao.dados_sugeridos.area} {'>'} {sugestao.dados_sugeridos.processo}
                      </p>
                      {showDetails && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Tipo: {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}</span>
                          <span>Data: {formatDate(sugestao.created_at)}</span>
                          {sugestao.justificativa && <span>Justificativa: {sugestao.justificativa.substring(0, 50)}...</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getStatusBadge(sugestao.status)}
                    {sugestao.status === 'rejeitada' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => handleReenviarSugestao(sugestao)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Reenviar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (viewMode === 'compact') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {mySugestoes.map((sugestao) => (
            <Card key={sugestao.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200">
              <CardContent className="p-3">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate" title={sugestao.dados_sugeridos.produto}>
                      {sugestao.dados_sugeridos.produto}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {sugestao.dados_sugeridos.area}
                    </p>
                  </div>
                  {getStatusBadge(sugestao.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (viewMode === 'detailed') {
      return (
        <div className="space-y-4">
          {mySugestoes.map((sugestao) => (
            <Card key={sugestao.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {sugestao.dados_sugeridos.produto}
                    </CardTitle>
                  </div>
                  {getStatusBadge(sugestao.status)}
                </div>
                <CardDescription className="text-sm space-y-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-secondary">
                      {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria de Serviço'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-muted-foreground">
                      Enviado em {formatDate(sugestao.created_at)}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Área</p>
                      <p className="text-blue-700 font-semibold">{sugestao.dados_sugeridos.area || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <FolderOpen className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-orange-600 font-medium text-sm">Processo</p>
                      <p className="text-orange-700 font-semibold">{sugestao.dados_sugeridos.processo || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-green-600 font-medium text-sm">Tipo</p>
                      <p className="text-green-700 font-semibold">{sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <User className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Status</p>
                      <p className="text-purple-700 font-semibold capitalize">{sugestao.status}</p>
                    </div>
                  </div>
                </div>

                {sugestao.dados_sugeridos.subprocesso && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-800">Subprocesso</h4>
                    <p className="text-sm text-green-700">{sugestao.dados_sugeridos.subprocesso}</p>
                  </div>
                )}

                {sugestao.dados_sugeridos.oQueE || sugestao.dados_sugeridos.descricao && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">Descrição</h4>
                    <p className="text-sm text-blue-700">{sugestao.dados_sugeridos.oQueE || sugestao.dados_sugeridos.descricao}</p>
                  </div>
                )}

                {sugestao.justificativa && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-orange-800">Justificativa</h4>
                    <p className="text-sm text-orange-700">{sugestao.justificativa}</p>
                  </div>
                )}

                {sugestao.comentario_admin && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-purple-800">Comentário do Admin</h4>
                    <p className="text-sm text-purple-700">{sugestao.comentario_admin}</p>
                  </div>
                )}

                {showPreview && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Prévia da Sugestão</h4>
                    <p className="text-sm text-muted-foreground">
                      Esta sugestão foi enviada para análise da equipe administrativa.
                      {sugestao.status === 'aprovada' && ' Sua sugestão foi aprovada e será implementada.'}
                      {sugestao.status === 'rejeitada' && ' Sua sugestão foi rejeitada. Você pode reenviar com melhorias.'}
                      {sugestao.status === 'pendente' && ' Sua sugestão está em análise.'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}
                    </Badge>
                  </div>

                  {sugestao.status === 'rejeitada' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleReenviarSugestao(sugestao)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Reenviar Sugestão
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return null;
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
          <div className="flex items-center space-x-2">
            <ViewOptions
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showDetails={showDetails}
              onShowDetailsChange={setShowDetails}
              showPreview={showPreview}
              onShowPreviewChange={setShowPreview}
            />
            <Button onClick={handleCreateSugestao}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Sugestão
            </Button>
          </div>
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
        <div className="space-y-6">
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
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Suas Sugestões
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mySugestoes.length} sugestão{mySugestoes.length !== 1 ? 'ões' : ''}
                </p>
              </div>
              {renderSugestaoCards()}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 