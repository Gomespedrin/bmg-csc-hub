import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  TrendingUp
} from "lucide-react";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";
import { GlobalSearch } from "@/components/search/GlobalSearch";

const Servicos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    area: '',
    status: '',
    demandaRotina: ''
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

    const matchesSearch = !searchTerm || 
      servico.produto.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.nome.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.processo?.nome.toLowerCase().includes(searchTerm) ||
      servico.subprocesso?.processo?.area?.nome.toLowerCase().includes(searchTerm);

    const matchesArea = !areaFilter || servico.subprocesso?.processo?.area?.nome === areaFilter;
    const matchesStatus = !statusFilter || servico.status === statusFilter;
    const matchesDemandaRotina = !demandaRotinaFilter || servico.demanda_rotina === demandaRotinaFilter;

    return matchesSearch && matchesArea && matchesStatus && matchesDemandaRotina;
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
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda'
  }));

  // Estatísticas
  const stats = {
    total: totalServicos,
    ativos: servicos.filter((s: any) => s.status === 'ativo').length,
    areas: new Set(servicos.map((s: any) => s.subprocesso?.processo?.area?.nome)).size,
    tempoMedio: '2.5 horas'
  };

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

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <GlobalSearch 
              placeholder="Buscar serviços, processos, áreas..."
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                Visualizar
              </Button>
            </div>
          </div>
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
          </p>
        </div>

        {/* Services Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
          </div>
        ) : formattedServicos.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
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
                : 'Não há serviços disponíveis no momento.'
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchParams({});
              setFilters({ area: '', status: '', demandaRotina: '' });
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