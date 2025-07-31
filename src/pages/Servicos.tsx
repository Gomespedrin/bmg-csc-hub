import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewOptions } from "@/components/ui/view-options";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ArrowLeft, 
  ArrowRight,
  Package,
  Clock,
  Target,
  TrendingUp,
  X,
  FilterX
} from "lucide-react";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";
import { GlobalSearch } from "@/components/search/GlobalSearch";

const Servicos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'detailed'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    area: '',
    status: '',
    demandaRotina: '',
    tempoMedio: '',
    sla: ''
  });

  const { data: servicosData, isLoading } = useServicos();
  const { data: areas } = useAreas();

  // Extrair dados dos serviços
  const servicos = (servicosData as any)?.services || [];
  const totalServicos = (servicosData as any)?.totalItems || 0;

  // Aplicar filtros
  const filteredServicos = servicos.filter((servico: any) => {
    const searchTerm = searchParams.get('busca')?.toLowerCase() || '';
    const areaFilter = filters.area;
    const statusFilter = filters.status;
    const demandaRotinaFilter = filters.demandaRotina;
    const tempoMedioFilter = filters.tempoMedio;
    const slaFilter = filters.sla;

    const matchesSearch = !searchTerm || 
      servico.produto.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.nome.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.processo?.nome.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.processo?.area?.nome.toLowerCase().includes(searchTerm);

    const matchesArea = !areaFilter || areaFilter === 'todas' || servico.subprocesso?.processo?.area?.nome === areaFilter;
    const matchesStatus = !statusFilter || statusFilter === 'todos' || servico.status === statusFilter;
    const matchesDemandaRotina = !demandaRotinaFilter || demandaRotinaFilter === 'todos' || servico.demanda_rotina === demandaRotinaFilter;
    
    const tempoMedio = servico.tempo_medio ? Math.ceil(servico.tempo_medio / 60) : 1;
    const matchesTempoMedio = !tempoMedioFilter || tempoMedioFilter === 'qualquer' || 
      (tempoMedioFilter === '1' && tempoMedio <= 1) ||
      (tempoMedioFilter === '2-5' && tempoMedio >= 2 && tempoMedio <= 5) ||
      (tempoMedioFilter === '5+' && tempoMedio > 5);

    const sla = servico.sla || 24;
    const matchesSla = !slaFilter || slaFilter === 'qualquer' || 
      (slaFilter === '2h' && sla <= 2) ||
      (slaFilter === '24h' && sla <= 24) ||
      (slaFilter === '48h' && sla <= 48) ||
      (slaFilter === '48h+' && sla > 48);

    return matchesSearch && matchesArea && matchesStatus && matchesDemandaRotina && matchesTempoMedio && matchesSla;
  });

  // Formatar serviços para ServiceCard
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
    subprocessoId: servico.subprocesso.id,
    processoId: servico.subprocesso.processo.id
  }));

  // Estatísticas
  const stats = {
    total: totalServicos,
    ativos: servicos.filter((s: any) => s.status === 'ativo').length,
    areas: new Set(servicos.map((s: any) => s.subprocesso?.processo?.area?.nome)).size,
    tempoMedio: '2.5 horas'
  };

  const clearFilters = () => {
    setFilters({
      area: '',
      status: '',
      demandaRotina: '',
      tempoMedio: '',
      sla: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Catálogo de Serviços</h1>
              <p className="text-muted-foreground">
                Explore todos os serviços disponíveis organizados por área, processo e subprocesso.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ViewOptions
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlobalSearch 
                placeholder="Buscar serviços, processos, áreas..."
                className="w-full"
              />
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Área</label>
                  <Select value={filters.area} onValueChange={(value) => setFilters({...filters, area: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as áreas</SelectItem>
                      {areas?.map((area: any) => (
                        <SelectItem key={area.id} value={area.nome}>
                          {area.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select value={filters.demandaRotina} onValueChange={(value) => setFilters({...filters, demandaRotina: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="Demanda">Demanda</SelectItem>
                      <SelectItem value="Rotina">Rotina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tempo Médio</label>
                  <Select value={filters.tempoMedio} onValueChange={(value) => setFilters({...filters, tempoMedio: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualquer">Qualquer tempo</SelectItem>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="2-5">2-5 dias</SelectItem>
                      <SelectItem value="5+">5+ dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">SLA</label>
                  <Select value={filters.sla} onValueChange={(value) => setFilters({...filters, sla: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer SLA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualquer">Qualquer SLA</SelectItem>
                      <SelectItem value="2h">2 horas</SelectItem>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="48h">48 horas</SelectItem>
                      <SelectItem value="48h+">48+ horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total de Serviços</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.ativos}</p>
                  <p className="text-sm text-muted-foreground">Serviços Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.areas}</p>
                  <p className="text-sm text-muted-foreground">Áreas Atendidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.tempoMedio}</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {formattedServicos.length} de {totalServicos} serviços 
            {searchParams.get('busca') && ` para "${searchParams.get('busca')}"`}
            {hasActiveFilters && (
              <span className="ml-2">
                • Filtros ativos: {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </p>
        </div>

        {/* Services Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
          </div>
        ) : formattedServicos.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : viewMode === 'list'
              ? "space-y-4"
              : viewMode === 'compact'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              : "grid grid-cols-1 lg:grid-cols-2 gap-8"
          }>
            {formattedServicos.map(servico => (
              <ServiceCard key={servico.id} service={servico} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchParams.get('busca') 
                ? `Não encontramos serviços para "${searchParams.get('busca')}".`
                : hasActiveFilters
                ? 'Nenhum serviço corresponde aos filtros aplicados.'
                : 'Não há serviços disponíveis no momento.'
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchParams({});
              clearFilters();
            }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Servicos;