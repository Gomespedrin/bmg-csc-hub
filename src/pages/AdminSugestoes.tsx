import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, Eye, Clock, FileText, Filter, FilterX, Search, Calendar, User, TrendingUp } from "lucide-react";
import { useSugestoes, useUpdateSugestao } from "@/hooks/useSugestoes";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AdminSugestoes() {
  const { toast } = useToast();
  const { data: sugestoes, isLoading } = useSugestoes();
  const updateSugestao = useUpdateSugestao();
  const [comentarioAdmin, setComentarioAdmin] = useState("");
  const [justificativaRejeicao, setJustificativaRejeicao] = useState("");
  const [selectedSugestao, setSelectedSugestao] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    tipo: '',
    search: '',
    dataInicio: '',
    dataFim: ''
  });

  // Aplicar filtros
  const filteredSugestoes = sugestoes?.filter(sugestao => {
    const matchesStatus = !filters.status || filters.status === 'todos' || sugestao.status === filters.status;
    const matchesTipo = !filters.tipo || filters.tipo === 'todos' || sugestao.tipo === filters.tipo;
    const matchesSearch = !filters.search || 
      sugestao.dados_sugeridos.produto?.toLowerCase().includes(filters.search.toLowerCase()) ||
      sugestao.dados_sugeridos.area?.toLowerCase().includes(filters.search.toLowerCase()) ||
      sugestao.justificativa?.toLowerCase().includes(filters.search.toLowerCase());
    
    const data = new Date(sugestao.created_at);
    const dataInicio = filters.dataInicio ? new Date(filters.dataInicio) : null;
    const dataFim = filters.dataFim ? new Date(filters.dataFim) : null;
    
    const matchesDataInicio = !dataInicio || data >= dataInicio;
    const matchesDataFim = !dataFim || data <= dataFim;
    
    return matchesStatus && matchesTipo && matchesSearch && matchesDataInicio && matchesDataFim;
  }) || [];

  // Estatísticas
  const stats = {
    total: sugestoes?.length || 0,
    pendentes: sugestoes?.filter(s => s.status === 'pendente').length || 0,
    aprovadas: sugestoes?.filter(s => s.status === 'aprovada').length || 0,
    rejeitadas: sugestoes?.filter(s => s.status === 'rejeitada').length || 0
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      tipo: '',
      search: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const handleApprove = async (id: string) => {
    if (processingId) return;
    
    setProcessingId(id);
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'aprovada',
        comentario_admin: comentarioAdmin
      });
      
      toast({
        title: "Sugestão aprovada",
        description: "A sugestão foi aprovada com sucesso.",
      });
      
      setComentarioAdmin("");
      setSelectedSugestao(null);
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      
      let errorMessage = "Erro ao aprovar sugestão. Verifique se você está logado.";
      
      if (error.message) {
        if (error.message.includes('área') && error.message.includes('obrigatório')) {
          errorMessage = "Nome da área é obrigatório.";
        } else if (error.message.includes('processo') && error.message.includes('obrigatório')) {
          errorMessage = "Nome do processo é obrigatório.";
        } else if (error.message.includes('subprocesso') && error.message.includes('obrigatório')) {
          errorMessage = "Nome do subprocesso é obrigatório.";
        } else if (error.message.includes('serviço') && error.message.includes('obrigatório')) {
          errorMessage = "Nome do serviço é obrigatório.";
        } else if (error.message.includes('selecionar uma área')) {
          errorMessage = "É necessário selecionar uma área para criar um processo/subprocesso/serviço.";
        } else if (error.message.includes('selecionar um processo')) {
          errorMessage = "É necessário selecionar um processo para criar um subprocesso/serviço.";
        } else if (error.message.includes('selecionar um subprocesso')) {
          errorMessage = "É necessário selecionar um subprocesso para criar um serviço.";
        } else if (error.message.includes('selecionar um serviço')) {
          errorMessage = "É necessário selecionar um serviço para edição.";
        } else if (error.message.includes('criar área')) {
          errorMessage = `Erro ao criar área: ${error.message.split('criar área: ')[1]}`;
        } else if (error.message.includes('criar processo')) {
          errorMessage = `Erro ao criar processo: ${error.message.split('criar processo: ')[1]}`;
        } else if (error.message.includes('criar subprocesso')) {
          errorMessage = `Erro ao criar subprocesso: ${error.message.split('criar subprocesso: ')[1]}`;
        } else if (error.message.includes('criar serviço')) {
          errorMessage = `Erro ao criar serviço: ${error.message.split('criar serviço: ')[1]}`;
        } else if (error.message.includes('atualizar área')) {
          errorMessage = `Erro ao atualizar área: ${error.message.split('atualizar área: ')[1]}`;
        } else if (error.message.includes('atualizar processo')) {
          errorMessage = `Erro ao atualizar processo: ${error.message.split('atualizar processo: ')[1]}`;
        } else if (error.message.includes('atualizar subprocesso')) {
          errorMessage = `Erro ao atualizar subprocesso: ${error.message.split('atualizar subprocesso: ')[1]}`;
        } else if (error.message.includes('atualizar serviço')) {
          errorMessage = `Erro ao atualizar serviço: ${error.message.split('atualizar serviço: ')[1]}`;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
      setTimeout(() => {
        setProcessingId(null);
      }, 10000);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return;
    
    if (!justificativaRejeicao.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "É obrigatório fornecer uma justificativa para rejeitar uma sugestão.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingId(id);
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'rejeitada',
        comentario_admin: `${justificativaRejeicao}${comentarioAdmin ? `\n\nComentário adicional: ${comentarioAdmin}` : ''}`
      });
      
      toast({
        title: "Sugestão rejeitada",
        description: "A sugestão foi rejeitada.",
      });
      
      setComentarioAdmin("");
      setJustificativaRejeicao("");
      setSelectedSugestao(null);
    } catch (error: any) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar sugestão. Verifique se você está logado.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'aprovada': { label: 'Aprovada', variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-200' },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return <Badge variant={statusInfo.variant} className={statusInfo.color}>{statusInfo.label}</Badge>;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Administração de Sugestões
            </h1>
            <p className="text-muted-foreground">
              Gerencie as sugestões enviadas pelos colaboradores
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Sugestões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendentes}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.aprovadas}</p>
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejeitadas}</p>
                  <p className="text-sm text-muted-foreground">Rejeitadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filtros e Busca</span>
                </CardTitle>
                <CardDescription>
                  Filtre e busque sugestões específicas
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {Object.values(filters).filter(v => v !== '').length}
                    </Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <FilterX className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Buscar</Label>
                  <Input
                    placeholder="Buscar por título, área, justificativa..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo</Label>
                  <Select value={filters.tipo} onValueChange={(value) => setFilters({...filters, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="novo">Novo Serviço</SelectItem>
                      <SelectItem value="melhoria">Melhoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Data Início</Label>
                  <Input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Data Fim</Label>
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredSugestoes.length} de {stats.total} sugestões
            {hasActiveFilters && (
              <span className="ml-2">
                • Filtros ativos: {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </p>
        </div>

        {/* Sugestões */}
        <div className="grid gap-6">
          {!filteredSugestoes || filteredSugestoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma sugestão encontrada
                </h3>
                <p className="text-muted-foreground text-center">
                  {hasActiveFilters 
                    ? 'Nenhuma sugestão corresponde aos filtros aplicados.'
                    : 'Não há sugestões para revisar no momento.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Limpar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredSugestoes.map((sugestao) => (
              <Card key={sugestao.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">
                        {sugestao.dados_sugeridos.produto}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria de Serviço'}
                        </Badge>
                        <span>•</span>
                        <span>Enviado em {formatDate(sugestao.created_at)}</span>
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

                  {sugestao.status === 'pendente' && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`justificativa-${sugestao.id}`}>
                            Justificativa para Rejeição *
                          </Label>
                          <Textarea
                            id={`justificativa-${sugestao.id}`}
                            placeholder="Explique o motivo da rejeição (obrigatório)..."
                            value={selectedSugestao === sugestao.id ? justificativaRejeicao : ''}
                            onChange={(e) => {
                              setSelectedSugestao(sugestao.id);
                              setJustificativaRejeicao(e.target.value);
                            }}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`comentario-${sugestao.id}`}>
                            Comentário Adicional (opcional)
                          </Label>
                          <Textarea
                            id={`comentario-${sugestao.id}`}
                            placeholder="Adicione um comentário adicional se necessário..."
                            value={selectedSugestao === sugestao.id ? comentarioAdmin : ''}
                            onChange={(e) => {
                              setSelectedSugestao(sugestao.id);
                              setComentarioAdmin(e.target.value);
                            }}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="flex-1" disabled={processingId === sugestao.id} aria-label="Aprovar sugestão">
                                {processingId === sugestao.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Aprovar
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Aprovar Sugestão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja aprovar esta sugestão? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(sugestao.id)}>
                                  Confirmar Aprovação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1" disabled={processingId === sugestao.id} aria-label="Rejeitar sugestão">
                                {processingId === sugestao.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Rejeitar
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Sugestão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja rejeitar esta sugestão? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleReject(sugestao.id)}>
                                  Confirmar Rejeição
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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