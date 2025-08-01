import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSugestoes, useUpdateSugestao } from "@/hooks/useSugestoes";
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  Filter, 
  FilterX, 
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar as CalendarIcon,
  Tag,
  Building,
  User as UserIcon,
  AlertTriangle,
  Eye,
  Edit,
  ArrowLeft
} from "lucide-react";

interface Filters {
  status: string;
  tipo: string;
  search: string;
  dataInicio: string;
  dataFim: string;
}

interface Sugestao {
  id: string;
  status: string;
  tipo: string;
  justificativa?: string;
  dados_sugeridos: any;
  created_at: string;
  comentario_admin?: string;
  user_id?: string;
}

export default function AdminSugestoes() {
  const { toast } = useToast();
  const { data: sugestoes, isLoading } = useSugestoes();
  const updateSugestao = useUpdateSugestao();

  // Debug dos dados
  console.log('🔍 useSugestoes - isLoading:', isLoading);
  console.log('🔍 useSugestoes - sugestoes:', sugestoes);
  console.log('🔍 useSugestoes - sugestoes length:', sugestoes?.length);

  const [selectedSugestao, setSelectedSugestao] = useState<Sugestao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comentarioAprovacao, setComentarioAprovacao] = useState('');
  const [justificativaRejeicao, setJustificativaRejeicao] = useState('');
  const [comentarioAdicional, setComentarioAdicional] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    tipo: '',
    search: '',
    dataInicio: '',
    dataFim: ''
  });

  const filteredSugestoes = sugestoes?.filter(sugestao => {
    const matchesStatus = !filters.status || sugestao.status === filters.status;
    const matchesTipo = !filters.tipo || sugestao.tipo === filters.tipo;
    const matchesSearch = !filters.search || 
      (sugestao.dados_sugeridos as any)?.produto?.toLowerCase().includes(filters.search.toLowerCase()) ||
      (sugestao.dados_sugeridos as any)?.oQueE?.toLowerCase().includes(filters.search.toLowerCase()) ||
      sugestao.justificativa?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDataInicio = !filters.dataInicio || new Date(sugestao.created_at) >= new Date(filters.dataInicio);
    const matchesDataFim = !filters.dataFim || new Date(sugestao.created_at) <= new Date(filters.dataFim);
    
    return matchesStatus && matchesTipo && matchesSearch && matchesDataInicio && matchesDataFim;
  }) || [];

  // Ordenar sugestões: pendentes primeiro
  const sortedSugestoes = [...filteredSugestoes].sort((a, b) => {
    if (a.status === 'pendente' && b.status !== 'pendente') return -1;
    if (a.status !== 'pendente' && b.status === 'pendente') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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

  const openSugestaoModal = (sugestao: any) => {
    console.log('🔍 Abrindo modal para sugestão:', sugestao);
    setSelectedSugestao(sugestao);
    setComentarioAprovacao('');
    setJustificativaRejeicao('');
    setComentarioAdicional('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('🔍 Fechando modal');
    setIsModalOpen(false);
    setSelectedSugestao(null);
    setComentarioAprovacao('');
    setJustificativaRejeicao('');
    setComentarioAdicional('');
  };

  const handleApprove = async () => {
    if (!selectedSugestao || processingId) return;
    
    setProcessingId(selectedSugestao.id);
    try {
      await updateSugestao.mutateAsync({
        id: selectedSugestao.id,
        status: 'aprovada',
        comentario_admin: comentarioAprovacao || undefined
      });
      
      toast({
        title: "Sugestão aprovada",
        description: "A sugestão foi aprovada com sucesso.",
      });
      
      closeModal();
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar sugestão. Verifique se você está logado.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSugestao || processingId) return;
    
    if (!justificativaRejeicao.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "É obrigatório fornecer uma justificativa para rejeitar uma sugestão.",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingId(selectedSugestao.id);
    try {
      const comentarioCompleto = `${justificativaRejeicao}${comentarioAdicional ? `\n\nComentário adicional: ${comentarioAdicional}` : ''}`;
      
      await updateSugestao.mutateAsync({
        id: selectedSugestao.id,
        status: 'rejeitada',
        comentario_admin: comentarioCompleto
      });
      
      toast({
        title: "Sugestão rejeitada",
        description: "A sugestão foi rejeitada.",
      });
      
      closeModal();
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
    const variants = {
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      aprovada: "bg-green-100 text-green-800 border-green-200",
      rejeitada: "bg-red-100 text-red-800 border-red-200"
    };
    return <Badge className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"} border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'aprovada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejeitada':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* INDICADOR DE NOVA VERSÃO */}
      <div className="bg-red-500 text-white p-4 rounded-lg text-center">
        <h2 className="text-xl font-bold">🚀 NOVA VERSÃO ATIVA!</h2>
        <p>Se você está vendo esta mensagem, as mudanças foram aplicadas com sucesso!</p>
      </div>

      {/* Debug info */}
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-sm">Debug: {sugestoes?.length || 0} sugestões carregadas</p>
        <p className="text-sm">Modal aberto: {isModalOpen ? 'Sim' : 'Não'}</p>
        <p className="text-sm">Sugestão selecionada: {selectedSugestao?.id || 'Nenhuma'}</p>
        <Button 
          onClick={() => {
            console.log('🔍 Teste manual do modal');
            setSelectedSugestao({
              id: 'teste',
              status: 'pendente',
              tipo: 'novo',
              justificativa: 'Teste',
              dados_sugeridos: { produto: 'Teste' },
              created_at: new Date().toISOString()
            });
            setIsModalOpen(true);
          }}
          className="mt-2"
        >
          Testar Modal Manualmente
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Avaliar Sugestões</h1>
          <p className="text-gray-600 mt-1">Avalie e gerencie sugestões dos usuários</p>
        </div>
        {stats.pendentes > 0 && (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              {stats.pendentes} sugestão{stats.pendentes > 1 ? 'ões' : ''} aguardando avaliação
            </span>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <FilterX className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Buscar por nome, descrição..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filters.tipo} onValueChange={(value) => setFilters(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="novo">Novo Serviço</SelectItem>
                  <SelectItem value="edicao">Edição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : sortedSugestoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma sugestão encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedSugestoes.map((sugestao) => (
              <Card 
                key={sugestao.id} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  sugestao.status === 'pendente' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30' : ''
                }`}
                onClick={() => {
                  console.log('🔍 Clicou na sugestão:', sugestao.id);
                  openSugestaoModal(sugestao);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(sugestao.status)}
                          {getStatusBadge(sugestao.status)}
                        </div>
                        {sugestao.status === 'pendente' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Aguardando Avaliação
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {(sugestao.dados_sugeridos as any)?.produto || 'Sugestão'}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {(sugestao.dados_sugeridos as any)?.oQueE || sugestao.justificativa}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Edição'}
                        </span>
                        <span className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {(sugestao.dados_sugeridos as any)?.area || 'Não informado'}
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(sugestao.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔍 Clicou no botão Ver Detalhes');
                          openSugestaoModal(sugestao);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Detalhes</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Teste Simples */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl z-[9999]">
          <DialogHeader>
            <DialogTitle>Teste Modal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Modal está funcionando!</p>
            <p>Sugestão selecionada: {selectedSugestao?.id || 'Nenhuma'}</p>
            <p>Status: {selectedSugestao?.status || 'N/A'}</p>
            <Button onClick={closeModal}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Sugestão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[9999]">
          {selectedSugestao && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" onClick={closeModal} className="p-0 h-auto">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold">
                      {(selectedSugestao.dados_sugeridos as any)?.produto || 'Sugestão'}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(selectedSugestao.status)}
                      <span className="text-sm text-gray-500">
                        Criado em {formatDate(selectedSugestao.created_at)}
                      </span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Descrição
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm">
                          {(selectedSugestao.dados_sugeridos as any)?.descricao || selectedSugestao.justificativa || 'Não informado'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Justificativa
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm">
                          {selectedSugestao.justificativa || 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedSugestao.dados_sugeridos && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Dados Sugeridos
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          {Object.entries(selectedSugestao.dados_sugeridos).map(([key, value]) => (
                            <div key={key} className="flex text-sm">
                              <span className="font-medium w-32 text-gray-700">{key}:</span>
                              <span className="flex-1">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedSugestao.comentario_admin && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Comentário do Administrador
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-l-blue-500">
                          <p className="text-sm">
                            {selectedSugestao.comentario_admin}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações - apenas para sugestões pendentes */}
                {selectedSugestao.status === 'pendente' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                      Avaliar Sugestão
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Aprovar */}
                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar Sugestão
                        </h4>
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Adicione um comentário adicional se necessário (opcional)..."
                            value={comentarioAprovacao}
                            onChange={(e) => setComentarioAprovacao(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button
                            onClick={handleApprove}
                            disabled={processingId === selectedSugestao.id}
                            className="bg-green-600 hover:bg-green-700 w-full"
                          >
                            {processingId === selectedSugestao.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processando...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Aprovar Sugestão
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Rejeitar */}
                      <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar Sugestão
                        </h4>
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Explique o motivo da rejeição (obrigatório)..."
                            value={justificativaRejeicao}
                            onChange={(e) => setJustificativaRejeicao(e.target.value)}
                            className="min-h-[80px]"
                            required
                          />
                          <Textarea
                            placeholder="Adicione um comentário adicional se necessário..."
                            value={comentarioAdicional}
                            onChange={(e) => setComentarioAdicional(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <Button
                            onClick={handleReject}
                            disabled={processingId === selectedSugestao.id || !justificativaRejeicao.trim()}
                            variant="destructive"
                            className="w-full"
                          >
                            {processingId === selectedSugestao.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processando...
                              </>
                            ) : (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Rejeitar Sugestão
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug info no modal */}
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-sm">Debug Modal:</p>
                  <p className="text-sm">ID: {selectedSugestao.id}</p>
                  <p className="text-sm">Status: {selectedSugestao.status}</p>
                  <p className="text-sm">Comentário Aprovação: {comentarioAprovacao}</p>
                  <p className="text-sm">Justificativa Rejeição: {justificativaRejeicao}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}