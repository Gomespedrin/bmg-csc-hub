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
import { ViewOptions, ViewMode } from "@/components/ui/view-options";

const AreaDetalhe = () => {
  const { slug } = useParams();
  const { data: areas } = useAreas();
  const { data: servicosData } = useServicos();

  // Estados para controle da interface
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedProcesso, setSelectedProcesso] = useState<any>(null);
  const [selectedSubprocesso, setSelectedSubprocesso] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Extrair o ID da área do slug usando a função existente
  const areaId = slug ? extractIdFromSlug(slug) : '';
  
  // Debug adicional para verificar a extração do ID
  console.log('🔧 ID Extraction Debug:', {
    slug,
    extractedId: areaId,
    isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(areaId)
  });
  
  // Encontrar a área específica pelo ID extraído
  const initialArea = areas?.find(a => {
    // Normalizar IDs para comparação
    const normalizedAreaId = String(a.id).trim();
    const normalizedSlugId = String(areaId).trim();
    const matches = normalizedAreaId === normalizedSlugId;
    
    console.log(`🔍 Comparing: "${normalizedAreaId}" === "${normalizedSlugId}" = ${matches}`);
    return matches;
  });
  
  // Debug adicional para verificar se a área foi encontrada
  console.log('🎯 Initial Area Found:', {
    areaId,
    initialArea: initialArea ? { id: initialArea.id, nome: initialArea.nome } : null,
    areasCount: areas?.length,
    firstArea: areas?.[0] ? { id: areas[0].id, nome: areas[0].nome } : null
  });
  
  // Debug para verificar as áreas disponíveis
  console.log('📋 Available Areas:', areas?.map(a => ({ id: a.id, nome: a.nome })));
  
  // Debug adicional para verificar a comparação de IDs
  console.log('🔍 ID Comparison Debug:', {
    areaId,
    areaIdType: typeof areaId,
    areasWithIds: areas?.map(a => ({ 
      id: a.id, 
      idType: typeof a.id, 
      matches: a.id === areaId 
    }))
  });
  
  // Debug logs
  console.log('🔍 AreaDetalhe Debug:', {
    slug,
    areaId,
    areasCount: areas?.length,
    initialArea: initialArea?.nome,
    selectedArea: selectedArea?.nome
  });
  
  // Inicializar área selecionada
  useEffect(() => {
    if (initialArea && !selectedArea) {
      console.log('✅ Setting selected area:', initialArea.nome);
      setSelectedArea(initialArea);
    } else if (areaId && areas && areas.length > 0 && !selectedArea) {
      console.log('⚠️ Initial area not found, but areaId exists:', areaId);
      console.log('Available areas:', areas.map(a => ({ id: a.id, nome: a.nome })));
      
      // Tentar encontrar a área novamente com diferentes estratégias
      const foundArea = areas.find(a => {
        const normalizedAreaId = String(a.id).trim();
        const normalizedSlugId = String(areaId).trim();
        return normalizedAreaId === normalizedSlugId;
      });
      if (foundArea) {
        console.log('✅ Found area on retry:', foundArea.nome);
        setSelectedArea(foundArea);
      }
    }
  }, [initialArea, areaId, areas, selectedArea]);

  // Verificação adicional para garantir que a área seja selecionada
  useEffect(() => {
    if (areas && areas.length > 0 && areaId && !selectedArea) {
      console.log('🔄 Additional check for area selection');
      const foundArea = areas.find(a => {
        const normalizedAreaId = String(a.id).trim();
        const normalizedSlugId = String(areaId).trim();
        return normalizedAreaId === normalizedSlugId;
      });
      if (foundArea) {
        console.log('✅ Found area in additional check:', foundArea.nome);
        setSelectedArea(foundArea);
      }
    }
  }, [areas, areaId, selectedArea]);

  // Filtrar serviços baseado na seleção
  const servicos = (servicosData as any)?.services || [];
  
  // Debug para verificar os serviços disponíveis
  console.log('📦 Available Services:', {
    totalServices: servicos.length,
    selectedArea: selectedArea?.nome,
    selectedProcesso: selectedProcesso?.nome,
    selectedSubprocesso: selectedSubprocesso?.nome
  });
  
  const filteredServicos = servicos.filter((servico: any) => {
    // Se uma área está selecionada, filtrar apenas serviços dessa área
    const matchesArea = !selectedArea || servico.subprocesso?.processo?.area?.id === selectedArea.id;
    
    // Se um processo está selecionado, filtrar apenas serviços desse processo
    const matchesProcesso = !selectedProcesso || servico.subprocesso?.processo?.id === selectedProcesso.id;
    
    // Se um subprocesso está selecionado, filtrar apenas serviços desse subprocesso
    const matchesSubprocesso = !selectedSubprocesso || servico.subprocesso?.id === selectedSubprocesso.id;
    
    // Busca por texto
    const matchesSearch = !searchTerm || 
      servico.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.subprocesso?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.subprocesso?.processo?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = !filterStatus || servico.status === filterStatus;

    return matchesArea && matchesProcesso && matchesSubprocesso && matchesSearch && matchesStatus;
  });
  
  // Debug para verificar os serviços filtrados
  console.log('🔍 Filtered Services:', {
    totalFiltered: filteredServicos.length,
    services: filteredServicos.slice(0, 3).map(s => s.produto)
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
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda',
    sistemaExistente: servico.sistema_existente,
    statusAutomatizacao: servico.status_automatizacao,
    statusValidacao: servico.status_validacao,
    linkSolicitacao: servico.link_solicitacao
  }));

  const handleAreaSelect = (area: any) => {
    console.log('🎯 Area selected:', area.nome, 'ID:', area.id);
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

  // Função para renderizar cards de serviços baseado no modo de visualização
  const renderServiceCards = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formattedServicos.map((servico) => (
            <Card key={servico.id} className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                      {servico.produto}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant={servico.status === "Ativo" ? "default" : "secondary"}
                    className={`ml-2 flex-shrink-0 text-xs font-medium ${
                      servico.status === "Ativo" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {servico.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm space-y-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="font-medium text-secondary">{servico.area}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <FolderOpen className="h-3 w-3" />
                    <span className="text-muted-foreground">{servico.processo}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{servico.subprocesso}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-blue-600 font-medium">Tempo</p>
                      <p className="text-blue-700 truncate">{servico.tempoMedio}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                    <Target className="h-3 w-3 text-orange-600" />
                    <div className="min-w-0">
                      <p className="text-orange-600 font-medium">SLA</p>
                      <p className="text-orange-700 truncate">{servico.sla}</p>
                    </div>
                  </div>
                </div>

                {showDetails && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          servico.demandaRotina === "Demanda"
                            ? "border-orange-200 text-orange-700 bg-orange-50"
                            : "border-blue-200 text-blue-700 bg-blue-50"
                        }`}
                      >
                        {servico.demandaRotina}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        servico.demandaRotina === "Demanda"
                          ? "border-orange-200 text-orange-700 bg-orange-50"
                          : "border-blue-200 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {servico.demandaRotina}
                    </Badge>
                    {servico.statusValidacao && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          servico.statusValidacao === "Validado"
                            ? "border-green-200 text-green-700 bg-green-50"
                            : "border-orange-200 text-orange-700 bg-orange-50"
                        }`}
                      >
                        {servico.statusValidacao}
                      </Badge>
                    )}
                  </div>

                  <Button asChild variant="outline" size="sm" className="text-xs h-8">
                    <Link to={createServicoUrl(servico.produto, servico.id)}>
                      Ver detalhes
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
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
          {formattedServicos.map((servico) => (
            <Card key={servico.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{servico.produto}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {servico.area} {'>'} {servico.processo} {'>'} {servico.subprocesso}
                      </p>
                      {showDetails && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Tempo: {servico.tempoMedio}</span>
                          <span>SLA: {servico.sla}</span>
                          <span>Tipo: {servico.demandaRotina}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={servico.status === "Ativo" ? "default" : "secondary"}
                        className={`text-xs ${
                          servico.status === "Ativo" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {servico.status}
                      </Badge>
                      {servico.statusValidacao && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            servico.statusValidacao === "Validado"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-orange-200 text-orange-700 bg-orange-50"
                          }`}
                        >
                          {servico.statusValidacao}
                        </Badge>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm" className="text-xs h-8">
                      <Link to={createServicoUrl(servico.produto, servico.id)}>
                        Ver detalhes
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
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
          {formattedServicos.map((servico) => (
            <Card key={servico.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200">
              <CardContent className="p-3">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate" title={servico.produto}>
                      {servico.produto}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {servico.area}
                    </p>
                  </div>
                  <Badge 
                    variant={servico.status === "Ativo" ? "default" : "secondary"}
                    className={`text-xs ${
                      servico.status === "Ativo" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {servico.status}
                  </Badge>
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
          {formattedServicos.map((servico) => (
            <Card key={servico.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {servico.produto}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant={servico.status === "Ativo" ? "default" : "secondary"}
                    className={`ml-3 flex-shrink-0 ${
                      servico.status === "Ativo" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {servico.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm space-y-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium text-secondary">{servico.area}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-muted-foreground">{servico.processo}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{servico.subprocesso}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Tempo Médio</p>
                      <p className="text-blue-700 font-semibold">{servico.tempoMedio}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Target className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-orange-600 font-medium text-sm">SLA</p>
                      <p className="text-orange-700 font-semibold">{servico.sla}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Package className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-green-600 font-medium text-sm">Tipo</p>
                      <p className="text-green-700 font-semibold">{servico.demandaRotina}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Status</p>
                      <p className="text-purple-700 font-semibold">{servico.status}</p>
                    </div>
                  </div>
                </div>

                {showPreview && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Prévia do Serviço</h4>
                    <p className="text-sm text-muted-foreground">
                      Este serviço está disponível para solicitação através do sistema de demandas.
                      Para mais informações, clique em "Ver detalhes".
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`${
                        servico.demandaRotina === "Demanda"
                          ? "border-orange-200 text-orange-700 bg-orange-50"
                          : "border-blue-200 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {servico.demandaRotina}
                    </Badge>
                  </div>

                  <Button asChild variant="default" size="sm">
                    <Link to={createServicoUrl(servico.produto, servico.id)}>
                      Ver detalhes completos
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return null;
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{area.nome}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{area.descricao}</p>
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
                <ViewOptions
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  showDetails={showDetails}
                  onShowDetailsChange={setShowDetails}
                  showPreview={showPreview}
                  onShowPreviewChange={setShowPreview}
                />
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
                {/* Debug info */}
                <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left">
                  <p><strong>Debug Info:</strong></p>
                  <p>Slug: {slug}</p>
                  <p>Area ID: {areaId}</p>
                  <p>Areas loaded: {areas?.length || 0}</p>
                  <p>Initial Area: {initialArea?.nome || 'Not found'}</p>
                  <p>Selected Area: {selectedArea?.nome || 'None'}</p>
                  <p>Areas available: {areas?.map(a => a.nome).join(', ') || 'None'}</p>
                </div>
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
                          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden bg-white border border-gray-200"
                          onClick={() => handleProcessoSelect(processo)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="h-5 w-5 text-secondary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{processo.nome}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {processo.descricao || 'Processo'}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {processo.subprocessos?.length || 0} subprocessos
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden bg-white border border-gray-200"
                          onClick={() => handleSubprocessoSelect(subprocesso)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="h-5 w-5 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{subprocesso.nome}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {subprocesso.descricao || 'Subprocesso'}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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

                    {renderServiceCards()}
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