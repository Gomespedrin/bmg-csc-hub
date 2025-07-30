import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useSugestoes, useCreateSugestao } from "@/hooks/useSugestoes";
import { useAreas } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
import { useToast } from "@/hooks/use-toast";

export default function MinhasSugestoes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedTipo, setSelectedTipo] = useState<'novo' | 'edicao'>('novo');
  const [selectedServico, setSelectedServico] = useState<any>(null);

  // Hooks para dados
  const { data: sugestoes, isLoading } = useSugestoes();
  const { data: areas } = useAreas();
  const { data: servicos } = useServicos({ showAll: true });
  const createSugestao = useCreateSugestao();

  // Filtrar sugestões do usuário atual
  const mySugestoes = sugestoes?.filter(sugestao => {
    const matchesSearch = sugestao.dados_sugeridos.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sugestao.dados_sugeridos.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sugestao.justificativa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || sugestao.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

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

  const handleCreateSugestao = () => {
    setFormData({});
    setSelectedTipo('novo');
    setSelectedServico(null);
    setIsCreateDialogOpen(true);
  };

  const handleSubmitSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dadosSugeridos = {
        area: formData.area,
        processo: formData.processo,
        subprocesso: formData.subprocesso,
        produto: formData.produto,
        oQueE: formData.oQueE,
        quemPodeUtilizar: formData.quemPodeUtilizar,
        tempoMedio: formData.tempoMedio,
        unidadeMedida: formData.unidadeMedida,
        sla: formData.sla,
        sli: formData.sli,
        demandaRotina: formData.demandaRotina,
        requisitosOperacionais: formData.requisitosOperacionais,
        observacoes: formData.observacoes
      };

      await createSugestao.mutateAsync({
        tipo: selectedTipo,
        dados_sugeridos: dadosSugeridos,
        justificativa: formData.justificativa,
        servico_id: selectedServico?.id
      });

      toast({
        title: "Sugestão enviada",
        description: "Sua sugestão foi enviada com sucesso e será analisada pelos administradores.",
      });

      setIsCreateDialogOpen(false);
      setFormData({});
      setSelectedTipo('novo');
      setSelectedServico(null);
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar sugestão. Verifique se você está logado.",
        variant: "destructive"
      });
    }
  };

  const getProcessosByArea = (areaId: string) => {
    const area = areas?.find(a => a.id === areaId);
    return area?.processos || [];
  };

  const getSubprocessosByProcesso = (processoId: string) => {
    const processo = areas?.flatMap(a => a.processos || []).find(p => p.id === processoId);
    return processo?.subprocessos || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
      <Header />
      
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
                      <p className="text-sm">{sugestao.dados_sugeridos.area}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Processo</Label>
                      <p className="text-sm">{sugestao.dados_sugeridos.processo || 'Não informado'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p className="text-sm mt-1">{sugestao.dados_sugeridos.oQueE}</p>
                  </div>

                  {sugestao.justificativa && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Justificativa</Label>
                      <p className="text-sm mt-1">{sugestao.justificativa}</p>
                    </div>
                  )}

                  {sugestao.comentario_admin && (
                    <div className="bg-muted p-3 rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Comentário do Administrador</Label>
                      <p className="text-sm mt-1">{sugestao.comentario_admin}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Diálogo de Nova Sugestão */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Sugestão</DialogTitle>
              <DialogDescription>
                Envie uma sugestão para inclusão ou melhoria de serviço no catálogo.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitSugestao} className="space-y-4">
              <Tabs defaultValue="tipo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tipo">Tipo de Sugestão</TabsTrigger>
                  <TabsTrigger value="dados">Dados do Serviço</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tipo" className="space-y-4">
                  <div>
                    <Label>Tipo de Sugestão</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={selectedTipo === 'novo' ? 'default' : 'outline'}
                        onClick={() => setSelectedTipo('novo')}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <Plus className="h-6 w-6" />
                        <span>Novo Serviço</span>
                        <span className="text-xs text-muted-foreground">Sugerir um novo serviço</span>
                      </Button>
                      <Button
                        type="button"
                        variant={selectedTipo === 'edicao' ? 'default' : 'outline'}
                        onClick={() => setSelectedTipo('edicao')}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <Edit className="h-6 w-6" />
                        <span>Melhoria de Serviço</span>
                        <span className="text-xs text-muted-foreground">Sugerir melhorias em serviço existente</span>
                      </Button>
                    </div>
                  </div>

                  {selectedTipo === 'edicao' && (
                    <div>
                      <Label htmlFor="servico_id">Serviço a Melhorar</Label>
                      <Select
                        value={selectedServico?.id || ''}
                        onValueChange={(value) => {
                          const servico = servicos?.services.find(s => s.id === value);
                          setSelectedServico(servico);
                          if (servico) {
                            setFormData({
                              ...formData,
                              produto: servico.produto,
                              oQueE: servico.o_que_e,
                              quemPodeUtilizar: servico.quem_pode_utilizar,
                              tempoMedio: servico.tempo_medio,
                              unidadeMedida: servico.unidade_medida,
                              sla: servico.sla,
                              sli: servico.sli,
                              demandaRotina: servico.demanda_rotina,
                              requisitosOperacionais: servico.requisitos_operacionais,
                              observacoes: servico.observacoes
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicos?.services.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                              {servico.subprocesso?.processo?.area?.nome} → {servico.subprocesso?.processo?.nome} → {servico.subprocesso?.nome} → {servico.produto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="area">Área *</Label>
                      <Select
                        value={formData.area || ''}
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            area: areas?.find(a => a.id === value)?.nome || '',
                            processo: '',
                            subprocesso: ''
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas?.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="processo">Processo</Label>
                      <Select
                        value={formData.processo || ''}
                        onValueChange={(value) => {
                          const processo = getProcessosByArea(areas?.find(a => a.nome === formData.area)?.id || '').find(p => p.id === value);
                          setFormData({ 
                            ...formData, 
                            processo: processo?.nome || '',
                            subprocesso: ''
                          });
                        }}
                        disabled={!formData.area}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um processo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getProcessosByArea(areas?.find(a => a.nome === formData.area)?.id || '').map((processo) => (
                            <SelectItem key={processo.id} value={processo.id}>
                              {processo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subprocesso">Subprocesso</Label>
                      <Select
                        value={formData.subprocesso || ''}
                        onValueChange={(value) => {
                          const subprocesso = getSubprocessosByProcesso(
                            getProcessosByArea(areas?.find(a => a.nome === formData.area)?.id || '').find(p => p.nome === formData.processo)?.id || ''
                          ).find(s => s.id === value);
                          setFormData({ ...formData, subprocesso: subprocesso?.nome || '' });
                        }}
                        disabled={!formData.processo}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um subprocesso" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSubprocessosByProcesso(
                            getProcessosByArea(areas?.find(a => a.nome === formData.area)?.id || '').find(p => p.nome === formData.processo)?.id || ''
                          ).map((subprocesso) => (
                            <SelectItem key={subprocesso.id} value={subprocesso.id}>
                              {subprocesso.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="produto">Produto/Serviço *</Label>
                      <Input
                        id="produto"
                        value={formData.produto || ''}
                        onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="oQueE">O que é</Label>
                    <Textarea
                      id="oQueE"
                      value={formData.oQueE || ''}
                      onChange={(e) => setFormData({ ...formData, oQueE: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quemPodeUtilizar">Quem pode utilizar</Label>
                    <Input
                      id="quemPodeUtilizar"
                      value={formData.quemPodeUtilizar || ''}
                      onChange={(e) => setFormData({ ...formData, quemPodeUtilizar: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tempoMedio">Tempo Médio</Label>
                      <Input
                        id="tempoMedio"
                        type="number"
                        value={formData.tempoMedio || ''}
                        onChange={(e) => setFormData({ ...formData, tempoMedio: e.target.value ? parseInt(e.target.value) : null })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                      <Select
                        value={formData.unidadeMedida || ''}
                        onValueChange={(value) => setFormData({ ...formData, unidadeMedida: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Minutos">Minutos</SelectItem>
                          <SelectItem value="Horas">Horas</SelectItem>
                          <SelectItem value="Dias">Dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="demandaRotina">Tipo de Demanda</Label>
                      <Select
                        value={formData.demandaRotina || ''}
                        onValueChange={(value) => setFormData({ ...formData, demandaRotina: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Demanda">Demanda</SelectItem>
                          <SelectItem value="Rotina">Rotina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sla">SLA (horas)</Label>
                      <Input
                        id="sla"
                        type="number"
                        value={formData.sla || ''}
                        onChange={(e) => setFormData({ ...formData, sla: e.target.value ? parseInt(e.target.value) : null })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sli">SLI (%)</Label>
                      <Input
                        id="sli"
                        type="number"
                        step="0.01"
                        value={formData.sli || ''}
                        onChange={(e) => setFormData({ ...formData, sli: e.target.value ? parseFloat(e.target.value) : null })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requisitosOperacionais">Requisitos Operacionais</Label>
                    <Textarea
                      id="requisitosOperacionais"
                      value={formData.requisitosOperacionais || ''}
                      onChange={(e) => setFormData({ ...formData, requisitosOperacionais: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="justificativa">Justificativa *</Label>
                    <Textarea
                      id="justificativa"
                      value={formData.justificativa || ''}
                      onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                      placeholder="Explique por que esta sugestão é importante..."
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({});
                  setSelectedTipo('novo');
                  setSelectedServico(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar Sugestão
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
} 