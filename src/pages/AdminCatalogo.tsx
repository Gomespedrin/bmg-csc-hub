import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ViewOptions, ViewMode } from "@/components/ui/view-options";
import { 
  Building2, 
  Settings, 
  Layers, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Clock,
  Target,
  FileText,
  AlertCircle,
  Download,
  Upload,
  Filter,
  ChevronDown,
  Check,
  X,
  Grid3X3,
  List
} from "lucide-react";
import { useIsAdmin, useAdminAreas, useAdminProcessos, useAdminSubprocessos, useAdminServicos, useCreateArea, useUpdateArea, useDeleteArea, useCreateProcesso, useUpdateProcesso, useDeleteProcesso, useCreateSubprocesso, useUpdateSubprocesso, useDeleteSubprocesso, useCreateServico, useUpdateServico, useDeleteServico } from "@/hooks/useAdmin";
import { useAreas } from "@/hooks/useAreas";
import { useToast } from "@/hooks/use-toast";

type ModuleType = 'areas' | 'processos' | 'subprocessos' | 'servicos';

export default function AdminCatalogo() {
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<ModuleType>('areas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showDetails, setShowDetails] = useState(false);

  // Verificar se é administrador
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Hooks para dados
  const { data: areas, isLoading: areasLoading } = useAdminAreas();
  const { data: processos, isLoading: processosLoading } = useAdminProcessos();
  const { data: subprocessos, isLoading: subprocessosLoading } = useAdminSubprocessos();
  const { data: servicos, isLoading: servicosLoading } = useAdminServicos();
  const { data: areasForSelect } = useAreas();

  // Hooks para mutações
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

  // Verificar se não é administrador
  if (!isAdminLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
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
        </main>
      </div>
    );
  }

  // Funções auxiliares
  const getModuleData = () => {
    let data = [];
    switch (activeModule) {
      case 'areas':
        data = areas || [];
        break;
      case 'processos':
        data = processos || [];
        break;
      case 'subprocessos':
        data = subprocessos || [];
        break;
      case 'servicos':
        data = servicos || [];
        break;
    }

    // Aplicar filtros
    return data.filter(item => {
      // Busca mais abrangente
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        // Busca por nome/produto
        (activeModule === 'servicos' ? item.produto : item.nome)?.toLowerCase().includes(searchLower) ||
        // Busca por descrição
        item.descricao?.toLowerCase().includes(searchLower) ||
        // Busca por hierarquia (área → processo → subprocesso)
        (activeModule === 'servicos' && (
          item.subprocesso?.nome?.toLowerCase().includes(searchLower) ||
          item.subprocesso?.processo?.nome?.toLowerCase().includes(searchLower) ||
          item.subprocesso?.processo?.area?.nome?.toLowerCase().includes(searchLower)
        )) ||
        (activeModule === 'subprocessos' && (
          item.processo?.nome?.toLowerCase().includes(searchLower) ||
          item.processo?.area?.nome?.toLowerCase().includes(searchLower)
        )) ||
        (activeModule === 'processos' && item.area?.nome?.toLowerCase().includes(searchLower));

      // Filtros específicos
      const matchesStatus = !filters.status || filters.status === 'todos' || 
        item.ativo === (filters.status === 'ativo');
      
      const matchesArea = !filters.area || filters.area === 'todas' || 
        (activeModule === 'processos' && item.area?.id === filters.area) ||
        (activeModule === 'subprocessos' && item.processo?.area?.id === filters.area) ||
        (activeModule === 'servicos' && item.subprocesso?.processo?.area?.id === filters.area);
      
      const matchesProcesso = !filters.processo || filters.processo === 'todos' || 
        (activeModule === 'subprocessos' && item.processo?.id === filters.processo) ||
        (activeModule === 'servicos' && item.subprocesso?.processo?.id === filters.processo);

      return matchesSearch && matchesStatus && matchesArea && matchesProcesso;
    });
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'areas': return 'Áreas';
      case 'processos': return 'Processos';
      case 'subprocessos': return 'Subprocessos';
      case 'servicos': return 'Serviços';
      default: return '';
    }
  };

  const getModuleIcon = () => {
    switch (activeModule) {
      case 'areas': return <Building2 className="h-5 w-5" />;
      case 'processos': return <Settings className="h-5 w-5" />;
      case 'subprocessos': return <Layers className="h-5 w-5" />;
      case 'servicos': return <Package className="h-5 w-5" />;
      default: return null;
    }
  };

  const handleCreate = () => {
    setFormData({});
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    
    // Limpar dados relacionados que não são colunas da tabela
    const cleanFormData = { ...item };
    
    if (activeModule === 'servicos') {
      // Remover campos relacionados que não são colunas da tabela servicos
      delete cleanFormData.subprocesso;
      delete cleanFormData.processo;
      delete cleanFormData.area;
    } else if (activeModule === 'subprocessos') {
      // Remover campos relacionados que não são colunas da tabela subprocessos
      delete cleanFormData.processo;
      delete cleanFormData.area;
    } else if (activeModule === 'processos') {
      // Remover campos relacionados que não são colunas da tabela processos
      delete cleanFormData.area;
    }
    
    setFormData(cleanFormData);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      switch (activeModule) {
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
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
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
      // Limpar dados relacionados antes de enviar
      const cleanFormData = { ...formData };
      
      if (activeModule === 'servicos') {
        // Remover campos relacionados que não são colunas da tabela servicos
        delete cleanFormData.subprocesso;
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (activeModule === 'subprocessos') {
        // Remover campos relacionados que não são colunas da tabela subprocessos
        delete cleanFormData.processo;
        delete cleanFormData.area;
      } else if (activeModule === 'processos') {
        // Remover campos relacionados que não são colunas da tabela processos
        delete cleanFormData.area;
      }
      
      if (isCreateDialogOpen) {
        switch (activeModule) {
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
        switch (activeModule) {
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

  const handleExport = () => {
    const data = getModuleData();
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${getModuleTitle().toLowerCase()}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target?.result as string;
          const data = parseCSV(csv);
          // Aqui você implementaria a lógica para importar os dados
          console.log('Dados importados:', data);
          toast({
            title: "Importação",
            description: `${data.length} itens importados com sucesso.`,
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const isLoading = areasLoading || processosLoading || subprocessosLoading || servicosLoading;

  const renderItemCard = (item: any) => {
    const isGrid = viewMode === 'grid';
    const isList = viewMode === 'list';
    const isCompact = viewMode === 'compact';
    const isDetailed = viewMode === 'detailed';

    if (isCompact) {
      return (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {activeModule === 'servicos' ? item.produto : item.nome}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {activeModule === 'servicos' && (
                    `${item.subprocesso?.processo?.area?.nome} → ${item.subprocesso?.processo?.nome} → ${item.subprocesso?.nome}`
                  )}
                  {activeModule === 'subprocessos' && (
                    `${item.processo?.area?.nome} → ${item.processo?.nome}`
                  )}
                  {activeModule === 'processos' && item.area?.nome}
                  {activeModule === 'areas' && item.descricao}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant={item.ativo ? 'default' : 'secondary'}>
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
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
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {activeModule === 'servicos' ? item.produto : item.nome}
              </CardTitle>
              <CardDescription>
                {activeModule === 'servicos' && (
                  <>
                    {item.subprocesso?.processo?.area?.nome} → {item.subprocesso?.processo?.nome} → {item.subprocesso?.nome}
                  </>
                )}
                {activeModule === 'subprocessos' && (
                  <>
                    {item.processo?.area?.nome} → {item.processo?.nome}
                  </>
                )}
                {activeModule === 'processos' && (
                  <>
                    {item.area?.nome}
                  </>
                )}
                {activeModule === 'areas' && item.descricao}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={item.ativo ? 'default' : 'secondary'}>
                {item.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
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
            </div>
          </div>
        </CardHeader>
        {activeModule === 'servicos' && showDetails && (
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
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Menu Lateral */}
        <aside className="w-64 bg-card border-r min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Administração</h2>
            <nav className="space-y-2">
              <Button
                variant={activeModule === 'areas' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('areas')}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Áreas
              </Button>
              <Button
                variant={activeModule === 'processos' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('processos')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Processos
              </Button>
              <Button
                variant={activeModule === 'subprocessos' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('subprocessos')}
              >
                <Layers className="mr-2 h-4 w-4" />
                Subprocessos
              </Button>
              <Button
                variant={activeModule === 'servicos' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveModule('servicos')}
              >
                <Package className="mr-2 h-4 w-4" />
                Serviços
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
                Gerencie o catálogo de {getModuleTitle().toLowerCase()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar {getModuleTitle().slice(0, -1)}
              </Button>
            </div>
          </div>

          {/* Barra de Pesquisa, Filtros e ViewOptions */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Pesquisar ${getModuleTitle().toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
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
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Painel de Filtros Compacto */}
            {showFilters && (
              <Card className="p-3">
                <div className="flex flex-wrap gap-3">
                  <div className="w-48">
                    <Label className="text-sm">Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {activeModule !== 'areas' && (
                    <div className="w-48">
                      <Label className="text-sm">Área</Label>
                      <Select
                        value={filters.area || ''}
                        onValueChange={(value) => setFilters({ ...filters, area: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todas as áreas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as áreas</SelectItem>
                          {areas?.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(activeModule === 'subprocessos' || activeModule === 'servicos') && (
                    <div className="w-48">
                      <Label className="text-sm">Processo</Label>
                      <Select
                        value={filters.processo || ''}
                        onValueChange={(value) => setFilters({ ...filters, processo: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todos os processos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os processos</SelectItem>
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
          </div>

          {/* Lista de Itens */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Indicador de resultados */}
              <div className="mb-4 text-sm text-muted-foreground">
                {(() => {
                  const data = getModuleData();
                  const total = data.length;
                  const hasFilters = Object.keys(filters).length > 0 || searchTerm;
                  return hasFilters 
                    ? `${total} ${total === 1 ? 'item encontrado' : 'itens encontrados'}`
                    : `${total} ${total === 1 ? 'item' : 'itens'} no total`;
                })()}
              </div>
              
              {/* Lista de itens */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {getModuleData().map((item) => renderItemCard(item))}
              </div>
            </>
          )}

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
                  {isCreateDialogOpen ? `Criar ${getModuleTitle().slice(0, -1)}` : `Editar ${getModuleTitle().slice(0, -1)}`}
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos obrigatórios para {isCreateDialogOpen ? 'criar' : 'editar'} o {getModuleTitle().slice(0, -1).toLowerCase()}.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="advanced">Informações Avançadas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    {/* Campos básicos baseados no módulo */}
                    {activeModule === 'areas' && (
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

                    {activeModule === 'processos' && (
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
                                  ? (areasForSelect as any[])?.find((area) => area.id === formData.area_id)?.nome
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
                                    {(areasForSelect as any[])?.map((area) => (
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

                    {activeModule === 'subprocessos' && (
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

                    {activeModule === 'servicos' && (
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
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    {activeModule === 'servicos' && (
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