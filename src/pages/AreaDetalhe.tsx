import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Building2, 
  Package, 
  Users, 
  Clock, 
  Target, 
  TrendingUp, 
  FileText, 
  Settings, 
  Zap, 
  ChevronRight, 
  FolderOpen,
  Grid3X3,
  List,
  Search,
  Filter
} from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
import { createProcessoUrl, createServicoUrl, extractIdFromSlug } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AreaDetalhe = () => {
  const { slug } = useParams();
  const { data: areas } = useAreas();
  const { data: servicosData } = useServicos();

  // Estados para controle da interface
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedProcesso, setSelectedProcesso] = useState<any>(null);
  const [selectedSubprocesso, setSelectedSubprocesso] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Extrair o ID da área do slug usando a função existente
  const areaId = slug ? extractIdFromSlug(slug) : '';
  
  // Encontrar a área específica pelo ID extraído
  const initialArea = areas?.find(a => a.id === areaId);
  
  // Inicializar área selecionada
  useEffect(() => {
    if (initialArea && !selectedArea) {
      setSelectedArea(initialArea);
    }
  }, [initialArea, selectedArea]);

  // Filtrar serviços baseado na seleção
  const servicos = (servicosData as any)?.services || [];
  const filteredServicos = servicos.filter((servico: any) => {
    const matchesArea = !selectedArea || servico.subprocesso?.processo?.area?.id === selectedArea.id;
    const matchesProcesso = !selectedProcesso || servico.subprocesso?.processo?.id === selectedProcesso.id;
    const matchesSubprocesso = !selectedSubprocesso || servico.subprocesso?.id === selectedSubprocesso.id;
    const matchesSearch = !searchTerm || 
      servico.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.subprocesso?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.subprocesso?.processo?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || servico.status === filterStatus;

    return matchesArea && matchesProcesso && matchesSubprocesso && matchesSearch && matchesStatus;
  });

  // Formatar serviços para exibição
  const formattedServicos = filteredServicos.map((servico: any) => ({
    id: servico.id,
    produto: servico.produto,
    subprocesso: servico.subprocesso.nome,
    processo: servico.subprocesso.processo.nome,
    area: servico.subprocesso.processo.area.nome,
    tempoMedio: servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : '1 dia',
    sla: servico.sla ? `${servico.sla} horas` : '24 horas',
    status: (servico.status === 'ativo' ? 'Ativo' : 'Inativo') as "Ativo" | "Inativo",
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda'
  }));

  const handleAreaSelect = (area: any) => {
    setSelectedArea(area);
    setSelectedProcesso(null);
    setSelectedSubprocesso(null);
  };

  const handleProcessoSelect = (processo: any) => {
    setSelectedProcesso(processo);
    setSelectedSubprocesso(null);
  };

  const handleSubprocessoSelect = (subprocesso: any) => {
    setSelectedSubprocesso(subprocesso);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setSelectedProcesso(null);
    setSelectedSubprocesso(null);
  };

  if (!areas || areas.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Nenhuma área encontrada</h2>
          <p className="text-muted-foreground mb-6">
            Não há áreas disponíveis no momento.
          </p>
          <Button asChild>
            <Link to="/por-area">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Áreas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex h-screen">
        {/* Sidebar - Áreas */}
        <div className="w-80 bg-card border-r flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Áreas</h2>
            <Input
              placeholder="Buscar áreas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {areas.map((area) => (
              <div
                key={area.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedArea?.id === area.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                }`}
                onClick={() => handleAreaSelect(area)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{area.nome}</h3>
                    <p className="text-xs text-muted-foreground">{area.descricao}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {area.processos?.length || 0} processos
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-card border-b p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedArea ? selectedArea.nome : 'Selecione uma Área'}
                </h1>
                {selectedArea && (
                  <p className="text-muted-foreground">
                    {selectedArea.descricao}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Buscar processos, subprocessos ou serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedArea ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma Área</h3>
                <p className="text-muted-foreground">
                  Escolha uma área na barra lateral para ver seus processos e serviços.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Processos */}
                {!selectedProcesso && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Processos</h2>
                      <Badge variant="outline">
                        {selectedArea.processos?.length || 0} processos
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArea.processos?.map((processo: any) => (
                        <Card 
                          key={processo.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleProcessoSelect(processo)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                <FolderOpen className="h-5 w-5 text-secondary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{processo.nome}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {processo.descricao || 'Processo'}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {processo.subprocessos?.length || 0} subprocessos
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subprocessos */}
                {selectedProcesso && !selectedSubprocesso && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedProcesso(null)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar aos Processos
                        </Button>
                        <h2 className="text-xl font-semibold">
                          Subprocessos - {selectedProcesso.nome}
                        </h2>
                      </div>
                      <Badge variant="outline">
                        {selectedProcesso.subprocessos?.length || 0} subprocessos
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProcesso.subprocessos?.map((subprocesso: any) => (
                        <Card 
                          key={subprocesso.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSubprocessoSelect(subprocesso)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                <FolderOpen className="h-5 w-5 text-accent" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{subprocesso.nome}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {subprocesso.descricao || 'Subprocesso'}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Serviços */}
                {selectedSubprocesso && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedSubprocesso(null)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar aos Subprocessos
                        </Button>
                        <h2 className="text-xl font-semibold">
                          Serviços - {selectedSubprocesso.nome}
                        </h2>
                      </div>
                      <Badge variant="outline">
                        {formattedServicos.length} serviços
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Lista de Serviços */}
                {formattedServicos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">
                        {selectedSubprocesso ? 'Serviços do Subprocesso' : 'Todos os Serviços'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formattedServicos.length} resultado{formattedServicos.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className={viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                      : "space-y-4"
                    }>
                      {formattedServicos.map((servico) => (
                        <Card key={servico.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{servico.produto}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {servico.subprocesso} {'>'} {servico.processo}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm text-muted-foreground">
                                      Tempo: {servico.tempoMedio}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      SLA: {servico.sla}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={servico.status === "Ativo" ? "default" : "secondary"}
                                  className={servico.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                >
                                  {servico.status}
                                </Badge>
                                <Button asChild variant="outline" size="sm">
                                  <Link to={createServicoUrl(servico.produto, servico.id)}>
                                    Ver detalhes
                                    <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {formattedServicos.length === 0 && (selectedProcesso || selectedSubprocesso || searchTerm || filterStatus) && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Não há serviços que correspondam aos filtros aplicados.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AreaDetalhe;