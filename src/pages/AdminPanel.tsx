import React, { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ViewOptions, ViewMode } from "@/components/ui/view-options";
import { 
  Users, 
  Settings, 
  MessageSquare, 
  FileText, 
  Shield, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Check,
  Grid3X3,
  List,
  Building2,
  Layers,
  Package,
  Target,
  Globe,
  Bell,
  Database
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
    processo: '',
    subprocesso: '',
    acao: ''
  });

  // Estados para visualização
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);

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
  
  // Estados para dados hierárquicos (como na página de sugestões)
  const [processosHierarquicos, setProcessosHierarquicos] = useState<any[]>([]);
  const [subprocessosHierarquicos, setSubprocessosHierarquicos] = useState<any[]>([]);
  
  // Carregar dados hierárquicos baseado na seleção
  useEffect(() => {
    if (formData.area_id && areas) {
      const areaSelecionada = areas.find(area => area.id === formData.area_id);
      if (areaSelecionada) {
        // Filtrar processos da área selecionada
        const processosDaArea = processos?.filter(processo => 
          processo.area_id === formData.area_id
        ) || [];
        setProcessosHierarquicos(processosDaArea);
        
        // Resetar subprocessos quando área muda
        setFormData(prev => ({
          ...prev,
          processo_id: '',
          subprocesso_id: ''
        }));
        setSubprocessosHierarquicos([]);
      }
    } else {
      setProcessosHierarquicos([]);
      setSubprocessosHierarquicos([]);
    }
  }, [formData.area_id, areas, processos]);
  
  // Carregar subprocessos baseado no processo selecionado
  useEffect(() => {
    if (formData.processo_id && processosHierarquicos.length > 0) {
      const processoSelecionado = processosHierarquicos.find(processo => 
        processo.id === formData.processo_id
      );
      if (processoSelecionado) {
        // Filtrar subprocessos do processo selecionado
        const subprocessosDoProcesso = subprocessos?.filter(subprocesso => 
          subprocesso.processo_id === formData.processo_id
        ) || [];
        setSubprocessosHierarquicos(subprocessosDoProcesso);
        
        // Resetar subprocesso quando processo muda
        setFormData(prev => ({
          ...prev,
          subprocesso_id: ''
        }));
      }
    } else {
      setSubprocessosHierarquicos([]);
    }
  }, [formData.processo_id, processosHierarquicos, subprocessos]);

  // Dados mockados para demonstração
  const mockUsers = [
    { id: '1', full_name: 'João Silva', email: 'joao@bmg.com', perfil: 'usuario', ativo: true, created_at: '2024-01-15' },
    { id: '2', full_name: 'Maria Santos', email: 'maria@bmg.com', perfil: 'administrador', ativo: true, created_at: '2024-01-14' },
    { id: '3', full_name: 'Pedro Costa', email: 'pedro@bmg.com', perfil: 'usuario', ativo: false, created_at: '2024-01-10' },
  ];

  const mockFAQ = [
    { id: '1', pergunta: 'Como solicitar um serviço?', resposta: 'Acesse o catálogo e clique no serviço desejado. Preencha os dados necessários e envie a solicitação. Você receberá um número de protocolo para acompanhamento.', categoria: 'Geral' },
    { id: '2', pergunta: 'Qual o prazo de resposta?', resposta: 'O prazo varia conforme o tipo de serviço. Serviços de rotina têm prazo de até 5 dias úteis. Serviços de demanda são analisados em até 48 horas.', categoria: 'Prazos' },
    { id: '3', pergunta: 'Como acompanhar minha solicitação?', resposta: 'Acesse sua área pessoal e clique em "Minhas Solicitações". Lá você encontrará o status atual e histórico de todas as suas solicitações.', categoria: 'Acompanhamento' },
    { id: '4', pergunta: 'Como sugerir um novo serviço?', resposta: 'Acesse a seção "Sugerir" no menu principal. Preencha o formulário com os detalhes do serviço que você gostaria de ver implementado.', categoria: 'Suporte' },
  ];

  const mockAuditoria = [
    { id: '1', usuario: { full_name: 'João Silva' }, acao: 'Login', created_at: '2024-01-15 10:30', detalhes: 'Login realizado com sucesso', ip: '192.168.1.100' },
    { id: '2', usuario: { full_name: 'Maria Santos' }, acao: 'Edição de serviço', created_at: '2024-01-14 15:45', detalhes: 'Serviço "Pagamento de Fornecedores" atualizado', ip: '192.168.1.101' },
    { id: '3', usuario: { full_name: 'Pedro Costa' }, acao: 'Criação de sugestão', created_at: '2024-01-13 09:20', detalhes: 'Nova sugestão criada: "Sistema de Relatórios Avançados"', ip: '192.168.1.102' },
    { id: '4', usuario: { full_name: 'Ana Oliveira' }, acao: 'Exclusão de área', created_at: '2024-01-12 14:15', detalhes: 'Área "Teste" removida do catálogo', ip: '192.168.1.103' },
    { id: '5', usuario: { full_name: 'Carlos Mendes' }, acao: 'Aprovação de sugestão', created_at: '2024-01-11 11:30', detalhes: 'Sugestão "Melhoria no Sistema de Notificações" aprovada', ip: '192.168.1.104' },
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
    
    // Pré-preencher o formulário com os dados do item
    const formDataToSet = { ...item };
    
    // Para serviços, carregar hierarquia completa
    if (activeModule === 'editar-catalogo' && catalogoModule === 'servicos') {
      formDataToSet.subprocesso_id = item.subprocesso_id || '';
      formDataToSet.processo_id = item.subprocesso?.processo?.id || '';
      formDataToSet.area_id = item.subprocesso?.processo?.area?.id || '';
      
      console.log('🔍 Serviço - subprocesso_id:', formDataToSet.subprocesso_id);
      console.log('🔍 Serviço - processo_id:', formDataToSet.processo_id);
      console.log('🔍 Serviço - area_id:', formDataToSet.area_id);
    }
    
    // Para subprocessos, carregar hierarquia
    if (activeModule === 'editar-catalogo' && catalogoModule === 'subprocessos') {
      formDataToSet.processo_id = item.processo_id || '';
      formDataToSet.area_id = item.processo?.area?.id || '';
      
      console.log('🔍 Subprocesso - processo_id:', formDataToSet.processo_id);
      console.log('🔍 Subprocesso - area_id:', formDataToSet.area_id);
    }
    
    // Para processos, carregar área
    if (activeModule === 'editar-catalogo' && catalogoModule === 'processos') {
      formDataToSet.area_id = item.area_id || '';
      
      console.log('🔍 Processo - area_id:', formDataToSet.area_id);
    }
    
    console.log('🔍 handleEdit - item:', item);
    console.log('🔍 handleEdit - formDataToSet:', formDataToSet);
    console.log('🔍 handleEdit - catalogoModule:', catalogoModule);
    
    setFormData(formDataToSet);
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
      // Implementar lógica de salvamento baseada no módulo ativo
      toast({
        title: "Sucesso",
        description: `Item ${isCreateDialogOpen ? 'criado' : 'atualizado'} com sucesso.`,
      });
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedItem(null);
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
      processo: '',
      subprocesso: '',
      acao: ''
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
        return <Badge variant="default">Aprovada</Badge>;
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
      // Preparar dados para envio
      const cleanFormData = { ...formData };
      
      // Remover campos que não devem ser enviados
      delete cleanFormData.subprocesso;
      delete cleanFormData.processo;
      delete cleanFormData.area;
      
      // Remover campos que são apenas para pré-seleção
      if (catalogoModule === 'servicos') {
        delete cleanFormData.processo_id;
        delete cleanFormData.area_id;
      } else if (catalogoModule === 'subprocessos') {
        delete cleanFormData.area_id;
      }
      
      console.log('🔍 handleCatalogoSubmit - cleanFormData:', cleanFormData);
      
      let result;
      
      if (isCreateDialogOpen) {
        switch (catalogoModule) {
          case 'areas':
            result = await createArea.mutateAsync(cleanFormData);
            break;
          case 'processos':
            result = await createProcesso.mutateAsync(cleanFormData);
            break;
          case 'subprocessos':
            result = await createSubprocesso.mutateAsync(cleanFormData);
            break;
          case 'servicos':
            result = await createServico.mutateAsync(cleanFormData);
            break;
          default:
            throw new Error('Módulo de catálogo não reconhecido');
        }
      } else {
        switch (catalogoModule) {
          case 'areas':
            result = await updateArea.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'processos':
            result = await updateProcesso.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'subprocessos':
            result = await updateSubprocesso.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          case 'servicos':
            result = await updateServico.mutateAsync({ id: selectedItem.id, ...cleanFormData });
            break;
          default:
            throw new Error('Módulo de catálogo não reconhecido');
        }
      }
      
      // Invalidar todas as queries relacionadas
      const queriesToInvalidate = [
        'admin-areas', 'admin-processos', 'admin-subprocessos', 'admin-servicos',
        'areas', 'processos', 'subprocessos', 'servicos'
      ];
      
      for (const queryKey of queriesToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
      
      // Fechar diálogos e limpar formulário
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
        description: `Erro ao salvar o item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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

  const getFilteredData = () => {
    const data = getModuleData();
    
    return data.filter(item => {
      // Filtro de busca
      const matchesSearch = !searchTerm || 
        (activeModule === 'usuarios' && 'full_name' in item && (
          (item as any).full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).email?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (activeModule === 'faq' && 'pergunta' in item && (
          (item as any).pergunta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).resposta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).categoria?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (activeModule === 'auditoria' && 'usuario' in item && (
          (item as any).usuario?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).acao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).detalhes?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (activeModule === 'avaliar-sugestoes' && 'dados_sugeridos' in item && 'justificativa' in item && (
          (item as any).dados_sugeridos?.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).dados_sugeridos?.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).justificativa?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (activeModule === 'avaliar-sugestoes' && 'tipo' in item && 'created_at' in item && (
          (item as any).tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item as any).created_at?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (activeModule === 'editar-catalogo' && (
          // Busca para áreas
          (catalogoModule === 'areas' && 'nome' in item && (item as any).nome?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          // Busca para processos
          (catalogoModule === 'processos' && 'nome' in item && (
            (item as any).nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).area?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
          // Busca para subprocessos
          (catalogoModule === 'subprocessos' && 'nome' in item && (
            (item as any).nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).processo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).processo?.area?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
          // Busca para serviços
          (catalogoModule === 'servicos' && 'produto' in item && (
            (item as any).produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).subprocesso?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).subprocesso?.processo?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item as any).subprocesso?.processo?.area?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        ));

      // Filtros específicos por módulo
      const matchesFilters = 
        (activeModule === 'usuarios' && 'perfil' in item && (
          (!filters.perfil || filters.perfil === 'todos' || (item as any).perfil === filters.perfil) &&
          (!filters.status || filters.status === 'todos' || (item as any).ativo === (filters.status === 'ativo'))
        )) ||
        (activeModule === 'faq' && 'categoria' in item && (
          !filters.categoria || filters.categoria === 'todas' || (item as any).categoria === filters.categoria
        )) ||
        (activeModule === 'auditoria' && 'acao' in item && (
          !filters.acao || filters.acao === 'todas' || (item as any).acao === filters.acao
        )) ||
        (activeModule === 'avaliar-sugestoes' && 'status' in item && 'tipo' in item && (
          (!filters.status || filters.status === 'todos' || (item as any).status === filters.status) &&
          (!filters.tipo || filters.tipo === 'todos' || (item as any).tipo === filters.tipo)
        )) ||
        (activeModule === 'editar-catalogo' && (
          // Filtro de status para catálogo
          (!filters.status || filters.status === 'todos' || (item as any).ativo === (filters.status === 'ativo')) &&
          // Filtro de área para processos, subprocessos e serviços
          (!filters.area || filters.area === 'todas' || 
            (catalogoModule === 'processos' && (item as any).area?.id === filters.area) ||
            (catalogoModule === 'subprocessos' && (item as any).processo?.area?.id === filters.area) ||
            (catalogoModule === 'servicos' && (item as any).subprocesso?.processo?.area?.id === filters.area)
          ) &&
          // Filtro de processo para subprocessos e serviços
          (!filters.processo || filters.processo === 'todos' ||
            (catalogoModule === 'subprocessos' && (item as any).processo?.id === filters.processo) ||
            (catalogoModule === 'servicos' && (item as any).subprocesso?.processo?.id === filters.processo)
          ) &&
          // Filtro de subprocesso para serviços
          (!filters.subprocesso || filters.subprocesso === 'todos' ||
            (catalogoModule === 'servicos' && (item as any).subprocesso?.id === filters.subprocesso)
          )
        ));

      return matchesSearch && matchesFilters;
    });
  };

  const renderModuleContent = () => {
    const data = getFilteredData();
    
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
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
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.rejeitadas}</p>
                    <p className="text-sm text-muted-foreground">Rejeitadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Sugestões */}
          <div className="space-y-4">
            {data.map((sugestao) => (
              <Card key={sugestao.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {sugestao.dados_sugeridos?.produto || 'Nova Sugestão'}
                      </CardTitle>
                      <CardDescription>
                        Área: {sugestao.dados_sugeridos?.area} • Tipo: {sugestao.tipo} • 
                        Criado em: {formatDate(sugestao.created_at)}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        {sugestao.justificativa}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(sugestao.status)}
                      <div className="flex space-x-1">
                        {sugestao.status === 'pendente' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(sugestao.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(sugestao.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sugestao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (activeModule === 'editar-catalogo') {
      const data = getFilteredData();
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
            <div className="flex items-center gap-3">
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
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <Filter className="mr-1 h-4 w-4" />
                Filtros
              </Button>
              
              <ViewOptions
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showDetails={showDetails}
                onShowDetailsChange={setShowDetails}
              />
              
              {(Object.keys(filters).length > 0 || searchTerm) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Filtros Inline */}
            {showFilters && (
              <div className="flex items-center gap-4 p-2 bg-muted/20 rounded border">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Status:</Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {catalogoModule !== 'areas' && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Área:</Label>
                    <Select
                      value={filters.area || ''}
                      onValueChange={(value) => {
                        // Reset processo and subprocesso when area changes
                        setFilters({ 
                          ...filters, 
                          area: value, 
                          processo: value === 'todas' ? '' : filters.processo,
                          subprocesso: value === 'todas' ? '' : filters.subprocesso
                        });
                      }}
                    >
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
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
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Processo:</Label>
                    <Select
                      value={filters.processo || ''}
                      onValueChange={(value) => {
                        // Reset subprocesso when processo changes
                        setFilters({ 
                          ...filters, 
                          processo: value,
                          subprocesso: value === 'todos' ? '' : filters.subprocesso
                        });
                      }}
                    >
                      <SelectTrigger className="w-40 h-7 text-xs">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {processos?.filter(processo => 
                          !filters.area || filters.area === 'todas' || processo.area?.id === filters.area
                        ).map((processo) => (
                          <SelectItem key={processo.id} value={processo.id}>
                            {processo.area?.nome} → {processo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {catalogoModule === 'servicos' && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Subprocesso:</Label>
                    <Select
                      value={filters.subprocesso || ''}
                      onValueChange={(value) => setFilters({ ...filters, subprocesso: value })}
                    >
                      <SelectTrigger className="w-44 h-7 text-xs">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {subprocessos?.filter(subprocesso => {
                          // Filter by selected area and processo
                          const matchesArea = !filters.area || filters.area === 'todas' || 
                            subprocesso.processo?.area?.id === filters.area;
                          const matchesProcesso = !filters.processo || filters.processo === 'todos' || 
                            subprocesso.processo?.id === filters.processo;
                          return matchesArea && matchesProcesso;
                        }).map((subprocesso) => (
                          <SelectItem key={subprocesso.id} value={subprocesso.id}>
                            {subprocesso.processo?.area?.nome} → {subprocesso.processo?.nome} → {subprocesso.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Itens */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
                viewMode === 'list' ? 'space-y-4' :
                viewMode === 'compact' ? 'grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2' :
                'space-y-2'
              }>
                {data.map((item) => (
                  <Card key={item.id} className={`hover:shadow-md transition-shadow ${
                    viewMode === 'compact' ? 'p-2' : ''
                  }`}>
                    <CardHeader className={viewMode === 'compact' ? 'p-2' : ''}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <CardTitle className={`${
                            viewMode === 'list' ? 'text-lg' : 
                            viewMode === 'compact' ? 'text-xs' : 
                            'text-xl'
                          } ${viewMode === 'compact' ? 'whitespace-nowrap overflow-hidden text-ellipsis' : 'break-words'} leading-tight`}>
                            {catalogoModule === 'servicos' ? item.produto : item.nome}
                          </CardTitle>
                          {viewMode !== 'compact' && (
                            <CardDescription className="break-words">
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
                          )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <Badge variant={item.ativo ? 'default' : 'secondary'} className={viewMode === 'compact' ? 'text-xs px-1' : ''}>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              size={viewMode === 'compact' ? 'sm' : 'sm'}
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              className={viewMode === 'compact' ? 'h-6 w-6 p-0' : ''}
                            >
                              <Edit className={viewMode === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size={viewMode === 'compact' ? 'sm' : 'sm'} variant="outline" className={viewMode === 'compact' ? 'h-6 w-6 p-0' : ''}>
                                  <Trash2 className={viewMode === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} />
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
                    {(catalogoModule === 'servicos' && (viewMode === 'grid' || viewMode === 'detailed' || showDetails)) && (
                      <CardContent className={viewMode === 'compact' ? 'p-2' : ''}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{item.quem_pode_utilizar || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{item.tempo_medio ? `${item.tempo_medio} ${item.unidade_medida}` : 'Não informado'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{item.sla ? `${item.sla}h` : 'Não informado'}</span>
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
          <ViewOptions
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showDetails={showDetails}
            onShowDetailsChange={setShowDetails}
          />
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
            <div className="flex flex-wrap gap-4">
              {activeModule === 'usuarios' && (
                <>
                  <div className="flex-1 min-w-[200px]">
                    <Label>Perfil</Label>
                    <Select
                      value={filters.perfil || ''}
                      onValueChange={(value) => setFilters({ ...filters, perfil: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os perfis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os perfis</SelectItem>
                        <SelectItem value="usuario">Usuário</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="superadministrador">Super Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label>Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {activeModule === 'faq' && (
                <div className="flex-1 min-w-[200px]">
                  <Label>Categoria</Label>
                  <Select
                    value={filters.categoria || ''}
                    onValueChange={(value) => setFilters({ ...filters, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Prazos">Prazos</SelectItem>
                      <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeModule === 'auditoria' && (
                <div className="flex-1 min-w-[200px]">
                  <Label>Ação</Label>
                  <Select
                    value={filters.acao || ''}
                    onValueChange={(value) => setFilters({ ...filters, acao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as ações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as ações</SelectItem>
                      <SelectItem value="Login">Login</SelectItem>
                      <SelectItem value="Edição de serviço">Edição de serviço</SelectItem>
                      <SelectItem value="Criação de sugestão">Criação de sugestão</SelectItem>
                      <SelectItem value="Exclusão de área">Exclusão de área</SelectItem>
                      <SelectItem value="Aprovação de sugestão">Aprovação de sugestão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Lista de Itens */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {data.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {activeModule === 'usuarios' && 'full_name' in item && (item as any).full_name}
                      {activeModule === 'faq' && 'pergunta' in item && (item as any).pergunta}
                      {activeModule === 'auditoria' && 'usuario' in item && `${(item as any).usuario?.full_name || 'Usuário'} - ${(item as any).acao}`}
                    </CardTitle>
                                          <CardDescription>
                        {activeModule === 'usuarios' && 'email' in item && (
                          <>
                            {(item as any).email} • {(item as any).perfil} • Criado em: {new Date((item as any).created_at).toLocaleDateString()}
                          </>
                        )}
                        {activeModule === 'faq' && 'categoria' in item && (
                          <>
                            {(item as any).categoria} • {(item as any).resposta.substring(0, 100)}...
                          </>
                        )}
                        {activeModule === 'auditoria' && 'created_at' in item && (
                          <>
                            {formatDate((item as any).created_at)} • {(item as any).detalhes}
                          </>
                        )}
                      </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeModule === 'usuarios' && 'ativo' in item && (
                      <Badge variant={(item as any).ativo ? 'default' : 'secondary'}>
                        {(item as any).ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                    {activeModule === 'faq' && 'categoria' in item && (
                      <Badge variant="outline">{(item as any).categoria}</Badge>
                    )}
                    {activeModule === 'auditoria' && 'acao' in item && (
                      <Badge variant="outline">{(item as any).acao}</Badge>
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
              {activeModule === 'auditoria' && showDetails && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">IP:</span>
                      <span>{(item as any).ip || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Data:</span>
                      <span>{formatDate((item as any).created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isCreateDialogOpen ? `Criar ${getModuleTitle().slice(0, -1)}` : `Editar Catálogo`}
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos obrigatórios para {isCreateDialogOpen ? 'criar' : 'editar'} o {getModuleTitle().slice(0, -1).toLowerCase()}.
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
                              <Label htmlFor="nome">Nome da Área *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
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
                            <div>
                              <Label htmlFor="icone">Ícone</Label>
                              <Input
                                id="icone"
                                value={formData.icone || ''}
                                onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                                placeholder="Nome do ícone (ex: building, users, etc.)"
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'processos' && (
                          <>
                            <div>
                              <Label htmlFor="nome">Nome do Processo *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="area_id">Área *</Label>
                              <Select
                                value={formData.area_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
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
                              <Label htmlFor="nome">Nome do Subprocesso *</Label>
                              <Input
                                id="nome"
                                value={formData.nome || ''}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="area_id">Área *</Label>
                              <Select
                                value={formData.area_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
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
                              <Label htmlFor="processo_id">Processo *</Label>
                              <Select
                                value={formData.processo_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, processo_id: value })}
                                disabled={!formData.area_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.area_id ? "Selecione um processo" : "Primeiro selecione uma área"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {processosHierarquicos.map((processo) => (
                                    <SelectItem key={processo.id} value={processo.id}>
                                      {processo.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Label htmlFor="produto">Nome do Serviço *</Label>
                              <Input
                                id="produto"
                                value={formData.produto || ''}
                                onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="area_id">Área *</Label>
                              <Select
                                value={formData.area_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, area_id: value })}
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
                              <Label htmlFor="processo_id">Processo *</Label>
                              <Select
                                value={formData.processo_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, processo_id: value })}
                                disabled={!formData.area_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.area_id ? "Selecione um processo" : "Primeiro selecione uma área"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {processosHierarquicos.map((processo) => (
                                    <SelectItem key={processo.id} value={processo.id}>
                                      {processo.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="subprocesso_id">Subprocesso *</Label>
                              <Select
                                value={formData.subprocesso_id || ''}
                                onValueChange={(value) => setFormData({ ...formData, subprocesso_id: value })}
                                disabled={!formData.processo_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.processo_id ? "Selecione um subprocesso" : "Primeiro selecione um processo"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {subprocessosHierarquicos.map((subprocesso) => (
                                    <SelectItem key={subprocesso.id} value={subprocesso.id}>
                                      {subprocesso.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="o_que_e">O que é</Label>
                              <Textarea
                                id="o_que_e"
                                value={formData.o_que_e || ''}
                                onChange={(e) => setFormData({ ...formData, o_que_e: e.target.value })}
                                placeholder="Descrição do que é este serviço"
                              />
                            </div>
                            <div>
                              <Label htmlFor="quem_pode_utilizar">Quem pode utilizar</Label>
                              <Input
                                id="quem_pode_utilizar"
                                value={formData.quem_pode_utilizar || ''}
                                onChange={(e) => setFormData({ ...formData, quem_pode_utilizar: e.target.value })}
                                placeholder="Ex: Todos os funcionários, Gerentes, etc."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="tempo_medio">Tempo Médio</Label>
                                <Input
                                  id="tempo_medio"
                                  type="number"
                                  value={formData.tempo_medio || ''}
                                  onChange={(e) => setFormData({ ...formData, tempo_medio: parseInt(e.target.value) || 0 })}
                                  placeholder="Ex: 5"
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
                                    <SelectItem value="dias">Dias</SelectItem>
                                    <SelectItem value="horas">Horas</SelectItem>
                                    <SelectItem value="minutos">Minutos</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="sla">SLA (horas)</Label>
                              <Input
                                id="sla"
                                type="number"
                                value={formData.sla || ''}
                                onChange={(e) => setFormData({ ...formData, sla: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 24"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    {activeModule === 'editar-catalogo' && (
                      <>
                        {catalogoModule === 'servicos' && (
                          <>
                            <div>
                              <Label htmlFor="sli">SLI (horas)</Label>
                              <Input
                                id="sli"
                                type="number"
                                value={formData.sli || ''}
                                onChange={(e) => setFormData({ ...formData, sli: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 48"
                              />
                            </div>
                            <div>
                              <Label htmlFor="ano">Ano de Implementação</Label>
                              <Input
                                id="ano"
                                type="number"
                                value={formData.ano || ''}
                                onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 2024"
                              />
                            </div>
                            <div>
                              <Label htmlFor="requisitos_operacionais">Requisitos Operacionais</Label>
                              <Textarea
                                id="requisitos_operacionais"
                                value={formData.requisitos_operacionais || ''}
                                onChange={(e) => setFormData({ ...formData, requisitos_operacionais: e.target.value })}
                                placeholder="Descreva os requisitos operacionais..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="observacoes">Observações</Label>
                              <Textarea
                                id="observacoes"
                                value={formData.observacoes || ''}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                placeholder="Observações adicionais..."
                              />
                            </div>
                            <div>
                              <Label htmlFor="demanda_rotina">Tipo de Demanda</Label>
                              <Select
                                value={formData.demanda_rotina || ''}
                                onValueChange={(value) => setFormData({ ...formData, demanda_rotina: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rotina">Rotina</SelectItem>
                                  <SelectItem value="demanda">Demanda</SelectItem>
                                  <SelectItem value="ambos">Ambos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {catalogoModule === 'areas' && (
                          <>
                            <div>
                              <Label htmlFor="cor">Cor da Área</Label>
                              <Input
                                id="cor"
                                type="color"
                                value={formData.cor || '#3b82f6'}
                                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="ordem">Ordem de Exibição</Label>
                              <Input
                                id="ordem"
                                type="number"
                                value={formData.ordem || ''}
                                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 1"
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'processos' && (
                          <>
                            <div>
                              <Label htmlFor="ordem">Ordem de Exibição</Label>
                              <Input
                                id="ordem"
                                type="number"
                                value={formData.ordem || ''}
                                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="responsavel">Responsável</Label>
                              <Input
                                id="responsavel"
                                value={formData.responsavel || ''}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                placeholder="Nome do responsável"
                              />
                            </div>
                          </>
                        )}

                        {catalogoModule === 'subprocessos' && (
                          <>
                            <div>
                              <Label htmlFor="ordem">Ordem de Exibição</Label>
                              <Input
                                id="ordem"
                                type="number"
                                value={formData.ordem || ''}
                                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="responsavel">Responsável</Label>
                              <Input
                                id="responsavel"
                                value={formData.responsavel || ''}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                placeholder="Nome do responsável"
                              />
                            </div>
                          </>
                        )}
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
                    {isCreateDialogOpen ? 'Criar' : 'Salvar'}
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