import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSugestoes, useUpdateSugestao } from "@/hooks/useSugestoes";
import { useIsAdmin, useAdminAreas, useAdminProcessos, useAdminSubprocessos, useAdminServicos, useCreateArea, useUpdateArea, useDeleteArea, useCreateProcesso, useUpdateProcesso, useDeleteProcesso, useCreateSubprocesso, useUpdateSubprocesso, useDeleteSubprocesso, useCreateServico, useUpdateServico, useDeleteServico, useAdminUsers } from "@/hooks/useAdmin";
import { useAreas } from "@/hooks/useAreas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ViewOptionsSimple } from "@/components/ui/view-options-simple";
import { 
  Users, 
  MessageSquare, 
  Settings, 
  FileText, 
  Shield, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  FilterX, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Eye,
  Grid3X3,
  List,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  HelpCircle,
  Star,
  TrendingUp,
  Target,
  Zap,
  Building2,
  Layers,
  Package,
  Globe,
  Bell,
  Database,
  ChevronDown
} from "lucide-react";

type AdminModule = 'usuarios' | 'avaliar-sugestoes' | 'editar-catalogo' | 'faq' | 'configuracoes' | 'auditoria';

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados principais
  const [activeModule, setActiveModule] = useState<AdminModule>('usuarios');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Estados para sugestões
  const [comentarioAdmin, setComentarioAdmin] = useState('');
  const [justificativaRejeicao, setJustificativaRejeicao] = useState('');
  const [selectedSugestao, setSelectedSugestao] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    perfil: '',
    categoria: '',
    area: '',
    processo: ''
  });

  // Estados para visualização
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks de dados
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: sugestoes, isLoading: sugestoesLoading } = useSugestoes();
  const updateSugestao = useUpdateSugestao();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

  // Hooks para catálogo
  const { data: areas, isLoading: areasLoading } = useAdminAreas();
  const { data: processos, isLoading: processosLoading } = useAdminProcessos();
  const { data: subprocessos, isLoading: subprocessosLoading } = useAdminSubprocessos();
  const { data: servicos, isLoading: servicosLoading } = useAdminServicos();
  const { data: areasForSelect } = useAreas();

  // Hooks para mutações do catálogo
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();
  const createProcesso = useCreateProcesso();
  const updateProcesso = useUpdateProcesso();
  const deleteProcesso = useDeleteProcesso();
  const createSubprocesso = useCreateSubprocesso();
  const updateSubprocesso = useUpdateSubprocesso();
  const deleteSubprocesso = useDeleteSubprocesso();
  const createServico = useCreateServico();
  const updateServico = useUpdateServico();
  const deleteServico = useDeleteServico();

  // Estado para módulo do catálogo
  const [catalogoModule, setCatalogoModule] = useState<'areas' | 'processos' | 'subprocessos' | 'servicos'>('areas');

  // Dados mockados para demonstração
  const mockUsers = [
    { id: '1', full_name: 'João Silva', email: 'joao@bmg.com', perfil: 'usuario', ativo: true, created_at: '2024-01-15' },
    { id: '2', full_name: 'Maria Santos', email: 'maria@bmg.com', perfil: 'administrador', ativo: true, created_at: '2024-01-14' },
    { id: '3', full_name: 'Pedro Costa', email: 'pedro@bmg.com', perfil: 'usuario', ativo: false, created_at: '2024-01-10' },
  ];

  const mockFAQ = [
    { id: '1', pergunta: 'Como solicitar um serviço?', resposta: 'Acesse o catálogo e clique no serviço desejado...', categoria: 'Geral' },
    { id: '2', pergunta: 'Qual o prazo de resposta?', resposta: 'O prazo varia conforme o tipo de serviço...', categoria: 'Prazos' },
    { id: '3', pergunta: 'Como acompanhar minha solicitação?', resposta: 'Acesse sua área pessoal para acompanhar...', categoria: 'Acompanhamento' },
  ];

  const mockAuditoria = [
    { id: '1', usuario: { full_name: 'João Silva' }, acao: 'Login', created_at: '2024-01-15 10:30', detalhes: 'Login realizado com sucesso' },
    { id: '2', usuario: { full_name: 'Maria Santos' }, acao: 'Edição de serviço', created_at: '2024-01-14 15:45', detalhes: 'Serviço "Pagamento" atualizado' },
    { id: '3', usuario: { full_name: 'Pedro Costa' }, acao: 'Criação de sugestão', created_at: '2024-01-13 09:20', detalhes: 'Nova sugestão criada' },
  ];

  // Funções auxiliares
  const getModuleTitle = () => {
    switch (activeModule) {
      case 'usuarios': return 'Usuários';
      case 'avaliar-sugestoes': return 'Avaliar Sugestões';
      case 'editar-catalogo': return 'Editar Catálogo';
      case 'faq': return 'Perguntas Frequentes';
      case 'configuracoes': return 'Configurações do Portal';
      case 'auditoria': return 'Auditoria';
      default: return '';
    }
  };

  const getModuleIcon = () => {
    switch (activeModule) {
      case 'usuarios': return <Users className="h-5 w-5" />;
      case 'avaliar-sugestoes': return <MessageSquare className="h-5 w-5" />;
      case 'editar-catalogo': return <Settings className="h-5 w-5" />;
      case 'faq': return <FileText className="h-5 w-5" />;
      case 'configuracoes': return <Shield className="h-5 w-5" />;
      case 'auditoria': return <Activity className="h-5 w-5" />;
      default: return null;
    }
  };

  const getModuleDescription = () => {
    switch (activeModule) {
      case 'usuarios': return 'Gerencie usuários, perfis e informações';
      case 'avaliar-sugestoes': return 'Avalie e gerencie sugestões dos usuários';
      case 'editar-catalogo': return 'Edite o catálogo de serviços';
      case 'faq': return 'Gerencie perguntas frequentes';
      case 'configuracoes': return 'Configure o portal';
      case 'auditoria': return 'Visualize logs e auditoria do sistema';
      default: return '';
    }
  };

  const handleCreate = () => {
    setFormData({});
    setSelectedItem(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    
    // Limpar dados relacionados que não são colunas da tabela
    const cleanFormData = { ...item };
    
    if (activeModule === 'editar-catalogo') {
      if (catalogoModule === 'servicos') {
        // Remover campos relacionados que não são colunas da tabela servicos
        delete cleanFormData.subprocesso;
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (catalogoModule === 'subprocessos') {
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (catalogoModule === 'processos') {
        delete cleanFormData.area;
      }
    }
    
    setFormData(cleanFormData);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Implementar lógica de exclusão baseada no módulo ativo
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir o item.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Implementar lógica de criação/edição baseada no módulo ativo
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedItem(null);
      toast({
        title: "Sucesso",
        description: `Item ${isCreateDialogOpen ? 'criado' : 'atualizado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o item.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      tipo: '',
      dataInicio: '',
      dataFim: '',
      perfil: '',
      categoria: '',
      area: '',
      processo: ''
    });
    setSearchTerm('');
  };

  // Funções para sugestões
  const handleApprove = async (id: string) => {
    if (!comentarioAdmin.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um comentário para aprovar a sugestão.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(id);
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'aprovada',
        comentario_admin: comentarioAdmin
      });
      
      setComentarioAdmin('');
      setSelectedSugestao(null);
      toast({
        title: "Sugestão Aprovada",
        description: "A sugestão foi aprovada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar sugestão.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!justificativaRejeicao.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione uma justificativa para rejeitar a sugestão.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(id);
    try {
      await updateSugestao.mutateAsync({
        id,
        status: 'rejeitada',
        comentario_admin: justificativaRejeicao
      });
      
      setJustificativaRejeicao('');
      setSelectedSugestao(null);
      toast({
        title: "Sugestão Rejeitada",
        description: "A sugestão foi rejeitada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar sugestão.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'aprovada':
        return <Badge variant="default" className="bg-green-500">Aprovada</Badge>;
      case 'rejeitada':
        return <Badge variant="destructive">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  // Funções para catálogo
  const getCatalogoData = () => {
    switch (catalogoModule) {
      case 'areas': return areas || [];
      case 'processos': return processos || [];
      case 'subprocessos': return subprocessos || [];
      case 'servicos': return servicos || [];
      default: return [];
    }
  };

  const getCatalogoTitle = () => {
    switch (catalogoModule) {
      case 'areas': return 'Áreas';
      case 'processos': return 'Processos';
      case 'subprocessos': return 'Subprocessos';
      case 'servicos': return 'Serviços';
      default: return '';
    }
  };

  const handleCatalogoDelete = async (id: string) => {
    try {
      switch (catalogoModule) {
        case 'areas':
          await deleteArea.mutateAsync(id);
          break;
        case 'processos':
          await deleteProcesso.mutateAsync(id);
          break;
        case 'subprocessos':
          await deleteSubprocesso.mutateAsync(id);
          break;
        case 'servicos':
          await deleteServico.mutateAsync(id);
          break;
      }
      
      toast({
        title: "Sucesso",
        description: `${getCatalogoTitle().slice(0, -1)} excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao excluir ${getCatalogoTitle().slice(0, -1).toLowerCase()}.`,
        variant: "destructive",
      });
    }
  };

  const handleCatalogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Limpar dados relacionados antes de enviar
      const cleanFormData = { ...formData };
      
      if (catalogoModule === 'servicos') {
        delete cleanFormData.subprocesso;
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (catalogoModule === 'subprocessos') {
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (catalogoModule === 'processos') {
        delete cleanFormData.area;
      }
      
      if (isCreateDialogOpen) {
        switch (catalogoModule) {
          case 'areas':
            await createArea.mutateAsync(cleanFormData);
            break;
          case 'processos':
            await createProcesso.mutateAsync(cleanFormData);
            break;
          case 'subprocessos':
            await createSubprocesso.mutateAsync(cleanFormData);
            break;
          case 'servicos':
            await createServico.mutateAsync(cleanFormData);
            break;
        }
      } else {
        switch (catalogoModule) {
          case 'areas':
            await updateArea.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'processos':
            await updateProcesso.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'subprocessos':
            await updateSubprocesso.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'servicos':
            await updateServico.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
        }
      }
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedItem(null);
      toast({
        title: "Sucesso",
        description: `Item ${isCreateDialogOpen ? 'criado' : 'atualizado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o item.",
        variant: "destructive",
      });
    }
  };

  const getModuleData = () => {
    switch (activeModule) {
      case 'usuarios': return users || [];
      case 'avaliar-sugestoes': return sugestoes || [];
      case 'editar-catalogo': return getCatalogoData();
      case 'faq': return mockFAQ;
      case 'auditoria': return mockAuditoria;
      default: return [];
    }
  };

  const renderModuleContent = () => {
    const data = getModuleData();
    
    // Verificar se não é administrador
    if (!isAdminLoading && !isAdmin) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Acesso Negado
            </h3>
            <p className="text-muted-foreground text-center">
              Você não tem permissão para acessar esta área. Entre em contato com um administrador.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (activeModule === 'avaliar-sugestoes') {
      // Estatísticas das sugestões
      const stats = {
        total: sugestoes?.length || 0,
        pendentes: sugestoes?.filter(s => s.status === 'pendente').length || 0,
        aprovadas: sugestoes?.filter(s => s.status === 'aprovada').length || 0,
        rejeitadas: sugestoes?.filter(s => s.status === 'rejeitada').length || 0
      };

      // Aplicar filtros às sugestões
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

      if (sugestoesLoading) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Filtros e ViewOptions */}
          <Card>
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
                  <ViewOptionsSimple
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                  <Button 
                    variant={showFilters ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <FilterX className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
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
                      value={filters.search || ''}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select value={filters.status || ''} onValueChange={(value) => setFilters({...filters, status: value})}>
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
                    <Select value={filters.tipo || ''} onValueChange={(value) => setFilters({...filters, tipo: value})}>
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
                      value={filters.dataInicio || ''}
                      onChange={(e) => setFilters({...filters, dataInicio: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Data Fim</Label>
                    <Input
                      type="date"
                      value={filters.dataFim || ''}
                      onChange={(e) => setFilters({...filters, dataFim: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Sugestões */}
          <div className="space-y-4">
            {!filteredSugestoes || filteredSugestoes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma sugestão encontrada
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {filters.search || filters.status || filters.tipo || filters.dataInicio || filters.dataFim
                      ? "Tente ajustar os filtros para encontrar sugestões."
                      : "Ainda não há sugestões para avaliar."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredSugestoes.map((sugestao) => (
                  <Card key={sugestao.id} className={viewMode === 'compact' ? 'p-4' : ''}>
                    <CardHeader className={viewMode === 'compact' ? 'p-0 pb-2' : ''}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {sugestao.dados_sugeridos.produto || 'Sugestão de Serviço'}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {sugestao.dados_sugeridos.area && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                {sugestao.dados_sugeridos.area}
                              </span>
                            )}
                            {sugestao.tipo && (
                              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {sugestao.tipo === 'novo' ? 'Novo Serviço' : 'Melhoria'}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(sugestao.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSugestao(sugestao)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {viewMode !== 'compact' && (
                      <CardContent>
                        <div className="space-y-3">
                          {sugestao.dados_sugeridos.o_que_e && (
                            <div>
                              <Label className="text-sm font-medium">O que é:</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {sugestao.dados_sugeridos.o_que_e}
                              </p>
                            </div>
                          )}
                          
                          {sugestao.justificativa && (
                            <div>
                              <Label className="text-sm font-medium">Justificativa:</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {sugestao.justificativa}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Criado em: {formatDate(sugestao.created_at)}</span>
                            {sugestao.status === 'pendente' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSugestao(sugestao);
                                    setComentarioAdmin('');
                                  }}
                                  disabled={processingId === sugestao.id}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSugestao(sugestao);
                                    setJustificativaRejeicao('');
                                  }}
                                  disabled={processingId === sugestao.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeModule === 'editar-catalogo') {
      const catalogoData = getCatalogoData();
      const isLoading = areasLoading || processosLoading || subprocessosLoading || servicosLoading;

      return (
        <div className="space-y-6">
          {/* Menu do Catálogo */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Catálogo</CardTitle>
              <CardDescription>
                Selecione o tipo de item que deseja gerenciar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant={catalogoModule === 'areas' ? 'default' : 'outline'}
                  onClick={() => setCatalogoModule('areas')}
                  className="h-20 flex-col"
                >
                  <Building2 className="h-6 w-6 mb-2" />
                  Áreas
                </Button>
                <Button
                  variant={catalogoModule === 'processos' ? 'default' : 'outline'}
                  onClick={() => setCatalogoModule('processos')}
                  className="h-20 flex-col"
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Processos
                </Button>
                <Button
                  variant={catalogoModule === 'subprocessos' ? 'default' : 'outline'}
                  onClick={() => setCatalogoModule('subprocessos')}
                  className="h-20 flex-col"
                >
                  <Layers className="h-6 w-6 mb-2" />
                  Subprocessos
                </Button>
                <Button
                  variant={catalogoModule === 'servicos' ? 'default' : 'outline'}
                  onClick={() => setCatalogoModule('servicos')}
                  className="h-20 flex-col"
                >
                  <Package className="h-6 w-6 mb-2" />
                  Serviços
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo do Catálogo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{getCatalogoTitle()}</h2>
                <p className="text-muted-foreground">
                  Gerencie o catálogo de {getCatalogoTitle().toLowerCase()}
                </p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar {getCatalogoTitle().slice(0, -1)}
              </Button>
            </div>

            {/* Barra de Pesquisa e Filtros */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Pesquisar ${getCatalogoTitle().toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              {(Object.keys(filters).length > 0 || searchTerm) && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {catalogoModule !== 'areas' && (
                    <div>
                      <Label>Área</Label>
                      <Select
                        value={filters.area || ''}
                        onValueChange={(value) => setFilters({ ...filters, area: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as áreas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas as áreas</SelectItem>
                          {areas?.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(catalogoModule === 'subprocessos' || catalogoModule === 'servicos') && (
                    <div>
                      <Label>Processo</Label>
                      <Select
                        value={filters.processo || ''}
                        onValueChange={(value) => setFilters({ ...filters, processo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os processos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os processos</SelectItem>
                          {processos?.map((processo) => (
                            <SelectItem key={processo.id} value={processo.id}>
                              {processo.area?.nome} → {processo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Lista de Itens */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {catalogoData.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">
                            {catalogoModule === 'servicos' ? item.produto : item.nome}
                          </CardTitle>
                          <CardDescription>
                            {catalogoModule === 'servicos' && (
                              <>
                                {item.subprocesso?.processo?.area?.nome} → {item.subprocesso?.processo?.nome} → {item.subprocesso?.nome}
                              </>
                            )}
                            {catalogoModule === 'subprocessos' && (
                              <>
                                {item.processo?.area?.nome} → {item.processo?.nome}
                              </>
                            )}
                            {catalogoModule === 'processos' && (
                              <>
                                {item.area?.nome}
                              </>
                            )}
                            {catalogoModule === 'areas' && item.descricao}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.ativo ? 'default' : 'secondary'}>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCatalogoDelete(item.id)}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {catalogoModule === 'servicos' && (
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{item.quem_pode_utilizar || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{item.tempo_medio ? `${item.tempo_medio} ${item.unidade_medida}` : 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{item.sla ? `${item.sla}h` : 'Não informado'}</span>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeModule === 'configuracoes') {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Portal</Label>
                  <Input 
                    defaultValue="Portal CSC - Centro de Serviços Compartilhados"
                    onChange={(e) => setFormData({ ...formData, nome_portal: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email de Contato</Label>
                  <Input 
                    defaultValue="csc@bmg.com"
                    onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Versão do Sistema</Label>
                  <Input 
                    defaultValue="1.0.0" 
                    disabled 
                  />
                </div>
                <div>
                  <Label>Última Atualização</Label>
                  <Input 
                    defaultValue="N/A" 
                    disabled 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="email-notifications" 
                  defaultChecked={true}
                  onChange={(e) => setFormData({ ...formData, notificacoes_email: e.target.checked })}
                />
                <Label htmlFor="email-notifications">Notificações por Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="push-notifications" 
                  defaultChecked={true}
                  onChange={(e) => setFormData({ ...formData, notificacoes_push: e.target.checked })}
                />
                <Label htmlFor="push-notifications">Notificações Push</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="sms-notifications" 
                  defaultChecked={false}
                  onChange={(e) => setFormData({ ...formData, notificacoes_sms: e.target.checked })}
                />
                <Label htmlFor="sms-notifications">Notificações SMS</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações de Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frequência de Backup</Label>
                  <Select 
                    defaultValue="diario"
                    onValueChange={(value) => setFormData({ ...formData, frequencia_backup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Retenção de Logs</Label>
                  <Select 
                    defaultValue="30"
                    onValueChange={(value) => setFormData({ ...formData, retencao_logs: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Barra de Pesquisa e Filtros */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Pesquisar ${getModuleTitle().toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary text-primary-foreground' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
          {activeModule !== 'auditoria' && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeModule === 'usuarios' && (
                <>
                  <div>
                    <Label>Perfil</Label>
                    <Select
                      value={filters.perfil || ''}
                      onValueChange={(value) => setFilters({ ...filters, perfil: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os perfis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os perfis</SelectItem>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="superadministrador">Super Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {activeModule === 'faq' && (
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={filters.categoria || ''}
                    onValueChange={(value) => setFilters({ ...filters, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Prazos">Prazos</SelectItem>
                      <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Lista de Itens */}
        <div className="grid gap-4">
          {data.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {activeModule === 'usuarios' && item.nome}
                      {activeModule === 'faq' && item.pergunta}
                      {activeModule === 'auditoria' && `${item.usuario?.full_name || 'Usuário'} - ${item.acao}`}
                    </CardTitle>
                    <CardDescription>
                      {activeModule === 'usuarios' && (
                        <>
                          {item.email} • {item.perfil} • Criado em: {new Date(item.created_at).toLocaleDateString()}
                        </>
                      )}
                      {activeModule === 'faq' && (
                        <>
                          {item.categoria} • {item.resposta.substring(0, 100)}...
                        </>
                      )}
                      {activeModule === 'auditoria' && (
                        <>
                          {new Date(item.created_at).toLocaleString()} • {item.detalhes}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeModule === 'usuarios' && (
                      <Badge variant={item.ativo ? 'default' : 'secondary'}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                    {activeModule === 'faq' && (
                      <Badge variant="outline">{item.categoria}</Badge>
                    )}
                    {activeModule === 'auditoria' && (
                      <Badge variant="outline">{item.acao}</Badge>
                    )}
                    
                    {activeModule !== 'auditoria' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Menu Lateral */}
        <aside className="w-64 bg-card border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Painel Administrativo</h2>
            <nav className="space-y-2">
              <Button
                variant={activeModule === 'usuarios' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('usuarios')}
              >
                <Users className="mr-2 h-4 w-4" />
                Usuários
              </Button>
              <Button
                variant={activeModule === 'avaliar-sugestoes' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('avaliar-sugestoes')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Avaliar Sugestões
              </Button>
              <Button
                variant={activeModule === 'editar-catalogo' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('editar-catalogo')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Editar Catálogo
              </Button>
              <Button
                variant={activeModule === 'faq' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('faq')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Perguntas Frequentes
              </Button>
              <Button
                variant={activeModule === 'configuracoes' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('configuracoes')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Configurações do Portal
              </Button>
              <Button
                variant={activeModule === 'auditoria' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('auditoria')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Auditoria
              </Button>
            </nav>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {getModuleTitle()}
              </h1>
              <p className="text-muted-foreground">
                {getModuleDescription()}
              </p>
            </div>
          </div>

          {renderModuleContent()}

          {/* Diálogo de Criação/Edição */}
          <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setFormData({});
              setSelectedItem(null);
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isCreateDialogOpen 
                    ? (activeModule === 'editar-catalogo' 
                        ? `Criar ${getCatalogoTitle().slice(0, -1)}` 
                        : `Criar ${getModuleTitle().slice(0, -1)}`)
                    : (activeModule === 'editar-catalogo' 
                        ? `Editar ${getCatalogoTitle().slice(0, -1)}` 
                        : `Editar ${getModuleTitle().slice(0, -1)}`)
                  }
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos obrigatórios para {isCreateDialogOpen ? 'criar' : 'editar'} o {
                    activeModule === 'editar-catalogo' 
                      ? getCatalogoTitle().slice(0, -1).toLowerCase()
                      : getModuleTitle().slice(0, -1).toLowerCase()
                  }.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={activeModule === 'editar-catalogo' ? handleCatalogoSubmit : handleSubmit} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="advanced">Informações Avançadas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    {activeModule === 'usuarios' && (
                      <>
                        <div>
                          <Label htmlFor="full_name">Nome Completo *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name || ''}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="perfil">Perfil *</Label>
                          <Select
                            value={formData.perfil || ''}
                            onValueChange={(value) => setFormData({ ...formData, perfil: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usuario">Usuário</SelectItem>
                              <SelectItem value="administrador">Administrador</SelectItem>
                              <SelectItem value="superadministrador">Super Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {activeModule === 'faq' && (
                      <>
                        <div>
                          <Label htmlFor="pergunta">Pergunta *</Label>
                          <Input
                            id="pergunta"
                            value={formData.pergunta || ''}
                            onChange={(e) => setFormData({ ...formData, pergunta: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="resposta">Resposta *</Label>
                          <Textarea
                            id="resposta"
                            value={formData.resposta || ''}
                            onChange={(e) => setFormData({ ...formData, resposta: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoria">Categoria *</Label>
                          <Select
                            value={formData.categoria || ''}
                            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Geral">Geral</SelectItem>
                              <SelectItem value="Prazos">Prazos</SelectItem>
                              <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
                              <SelectItem value="Suporte">Suporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {activeModule === 'editar-catalogo' && (
                      <>
                        {catalogoModule === 'areas' && (
                          <>
                            <div>
                              <Label htmlFor="nome">Nome *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="icone">Ícone</Label>
                              <Input
                                id="icone"
                                value={formData.icone || ''}
                                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                                placeholder="👥"
                              />
                            </div>
                            <div>
                              <Label htmlFor="descricao">Descrição</Label>
                              <Textarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'processos' && (
                          <>
                            <div>
                              <Label htmlFor="nome">Nome *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="area_id">Área *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                  >
                                    {formData.area_id
                                      ? areasForSelect?.find((area) => area.id === formData.area_id)?.nome
                                      : "Selecione uma área..."}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar área..." />
                                    <CommandList>
                                      <CommandEmpty>Nenhuma área encontrada.</CommandEmpty>
                                      <CommandGroup>
                                        {areasForSelect?.map((area) => (
                                          <CommandItem
                                            key={area.id}
                                            value={area.nome}
                                            onSelect={() => setFormData({ ...formData, area_id: area.id })}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                formData.area_id === area.id ? "opacity-100" : "opacity-0"
                                              }`}
                                            />
                                            {area.nome}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor="descricao">Descrição</Label>
                              <Textarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'subprocessos' && (
                          <>
                            <div>
                              <Label htmlFor="nome">Nome *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="processo_id">Processo *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                  >
                                    {formData.processo_id
                                      ? processos?.find((processo) => processo.id === formData.processo_id)?.nome
                                      : "Selecione um processo..."}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar processo..." />
                                    <CommandList>
                                      <CommandEmpty>Nenhum processo encontrado.</CommandEmpty>
                                      <CommandGroup>
                                        {processos?.map((processo) => (
                                          <CommandItem
                                            key={processo.id}
                                            value={`${processo.area?.nome} ${processo.nome}`}
                                            onSelect={() => setFormData({ ...formData, processo_id: processo.id })}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                formData.processo_id === processo.id ? "opacity-100" : "opacity-0"
                                              }`}
                                            />
                                            {processo.area?.nome} → {processo.nome}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor="descricao">Descrição</Label>
                              <Textarea
                                id="descricao"
                                value={formData.descricao || ''}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'servicos' && (
                          <>
                            <div>
                              <Label htmlFor="produto">Produto/Serviço *</Label>
                              <Input
                                id="produto"
                                value={formData.produto || ''}
                                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="subprocesso_id">Subprocesso *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                  >
                                    {formData.subprocesso_id
                                      ? subprocessos?.find((subprocesso) => subprocesso.id === formData.subprocesso_id)?.nome
                                      : "Selecione um subprocesso..."}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar subprocesso..." />
                                    <CommandList>
                                      <CommandEmpty>Nenhum subprocesso encontrado.</CommandEmpty>
                                      <CommandGroup>
                                        {subprocessos?.map((subprocesso) => (
                                          <CommandItem
                                            key={subprocesso.id}
                                            value={`${subprocesso.processo?.area?.nome} ${subprocesso.processo?.nome} ${subprocesso.nome}`}
                                            onSelect={() => setFormData({ ...formData, subprocesso_id: subprocesso.id })}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                formData.subprocesso_id === subprocesso.id ? "opacity-100" : "opacity-0"
                                              }`}
                                            />
                                            {subprocesso.processo?.area?.nome} → {subprocesso.processo?.nome} → {subprocesso.nome}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor="o_que_e">O que é</Label>
                              <Textarea
                                id="o_que_e"
                                value={formData.o_que_e || ''}
                                onChange={(e) => setFormData({ ...formData, o_que_e: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="quem_pode_utilizar">Quem pode utilizar</Label>
                              <Input
                                id="quem_pode_utilizar"
                                value={formData.quem_pode_utilizar || ''}
                                onChange={(e) => setFormData({ ...formData, quem_pode_utilizar: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    {activeModule === 'usuarios' && (
                      <>
                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={formData.telefone || ''}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="departamento">Departamento</Label>
                          <Input
                            id="departamento"
                            value={formData.departamento || ''}
                            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {activeModule === 'faq' && (
                      <>
                        <div>
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            value={formData.tags || ''}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="Ex: pagamento, prazo, acompanhamento"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ordem">Ordem de Exibição</Label>
                          <Input
                            id="ordem"
                            type="number"
                            value={formData.ordem || ''}
                            onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </>
                    )}

                    {activeModule === 'editar-catalogo' && catalogoModule === 'servicos' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tempo_medio">Tempo Médio</Label>
                            <Input
                              id="tempo_medio"
                              type="number"
                              value={formData.tempo_medio || ''}
                              onChange={(e) => setFormData({ ...formData, tempo_medio: e.target.value ? parseInt(e.target.value) : null })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                            <Select
                              value={formData.unidade_medida || ''}
                              onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                          <Label htmlFor="demanda_rotina">Tipo de Demanda</Label>
                          <Select
                            value={formData.demanda_rotina || ''}
                            onValueChange={(value) => setFormData({ ...formData, demanda_rotina: value })}
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
                        <div>
                          <Label htmlFor="requisitos_operacionais">Requisitos Operacionais</Label>
                          <Textarea
                            id="requisitos_operacionais"
                            value={formData.requisitos_operacionais || ''}
                            onChange={(e) => setFormData({ ...formData, requisitos_operacionais: e.target.value })}
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
                      </>
                    )}
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setFormData({});
                    setSelectedItem(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isCreateDialogOpen ? (activeModule === 'editar-catalogo' ? `Criar ${getCatalogoTitle().slice(0, -1)}` : 'Criar') : 'Salvar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 