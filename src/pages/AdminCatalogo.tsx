import { useState } from "react";
import { Header } from "@/components/layout/Header";
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
  AlertCircle
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
        <Header />
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
    switch (activeModule) {
      case 'areas':
        return areas?.filter(item => 
          item.nome.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      case 'processos':
        return processos?.filter(item => 
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.area?.nome.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      case 'subprocessos':
        return subprocessos?.filter(item => 
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.processo?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.processo?.area?.nome.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      case 'servicos':
        return servicos?.filter(item => 
          item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subprocesso?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subprocesso?.processo?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subprocesso?.processo?.area?.nome.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      default:
        return [];
    }
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
    setFormData(item);
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
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isCreateDialogOpen) {
        switch (activeModule) {
          case 'areas':
            await createArea.mutateAsync(formData);
            break;
          case 'processos':
            await createProcesso.mutateAsync(formData);
            break;
          case 'subprocessos':
            await createSubprocesso.mutateAsync(formData);
            break;
          case 'servicos':
            await createServico.mutateAsync(formData);
            break;
        }
      } else {
        switch (activeModule) {
          case 'areas':
            await updateArea.mutateAsync({ id: selectedItem.id, ...formData });
            break;
          case 'processos':
            await updateProcesso.mutateAsync({ id: selectedItem.id, ...formData });
            break;
          case 'subprocessos':
            await updateSubprocesso.mutateAsync({ id: selectedItem.id, ...formData });
            break;
          case 'servicos':
            await updateServico.mutateAsync({ id: selectedItem.id, ...formData });
            break;
        }
      }
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const isLoading = areasLoading || processosLoading || subprocessosLoading || servicosLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar {getModuleTitle().slice(0, -1)}
            </Button>
          </div>

          {/* Barra de Pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Pesquisar ${getModuleTitle().toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Itens */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {getModuleData().map((item) => (
                <Card key={item.id}>
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
                      </div>
                    </div>
                  </CardHeader>
                  {activeModule === 'servicos' && (
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
                          <Select
                            value={formData.area_id || ''}
                            onValueChange={(value) => setFormData({ ...formData, area_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma área" />
                            </SelectTrigger>
                            <SelectContent>
                              {areasForSelect?.map((area) => (
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
                          <Select
                            value={formData.processo_id || ''}
                            onValueChange={(value) => setFormData({ ...formData, processo_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um processo" />
                            </SelectTrigger>
                            <SelectContent>
                              {processos?.map((processo) => (
                                <SelectItem key={processo.id} value={processo.id}>
                                  {processo.area?.nome} → {processo.nome}
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
                          <Select
                            value={formData.subprocesso_id || ''}
                            onValueChange={(value) => setFormData({ ...formData, subprocesso_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um subprocesso" />
                            </SelectTrigger>
                            <SelectContent>
                              {subprocessos?.map((subprocesso) => (
                                <SelectItem key={subprocesso.id} value={subprocesso.id}>
                                  {subprocesso.processo?.area?.nome} → {subprocesso.processo?.nome} → {subprocesso.nome}
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