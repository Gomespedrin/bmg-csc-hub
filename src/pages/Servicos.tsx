import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { HorizontalFilterPanel } from "@/components/filters/HorizontalFilterPanel";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ViewOptions, ViewMode } from "@/components/ui/view-options";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, List, Square } from "lucide-react";
import { useServicos } from "@/hooks/useServicos";

export default function Servicos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showDetails, setShowDetails] = useState(false);

  // Inicializar filtros a partir da URL
  const [filters, setFilters] = useState({
    areas: searchParams.get("areas")?.split(",").filter(Boolean) || [],
    processos: searchParams.get("processos")?.split(",").filter(Boolean) || [],
    subprocessos: searchParams.get("subprocessos")?.split(",").filter(Boolean) || [],
    produto: searchParams.get("produto") || "",
    demandaRotina: searchParams.get("demandaRotina") || "todos",
    status: searchParams.get("status")?.split(",").filter(Boolean) || [],
  });

  const searchTerm = searchParams.get("busca") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Buscar serviços com filtros
  const { data: servicosData, isLoading } = useServicos({
    ...filters,
    busca: searchTerm,
    page: currentPage,
    pageSize: 20,
    showAll: true // Mostrar todos os serviços
  });

  const servicos = (servicosData as any)?.services || [];
  const totalItems = (servicosData as any)?.totalItems || 0;
  const totalPages = (servicosData as any)?.totalPages || 1;

  // Atualizar URL quando filtros mudarem
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.areas.length > 0) params.set("areas", filters.areas.join(","));
    if (filters.processos.length > 0) params.set("processos", filters.processos.join(","));
    if (filters.subprocessos.length > 0) params.set("subprocessos", filters.subprocessos.join(","));
    if (filters.produto) params.set("produto", filters.produto);
    if (filters.demandaRotina !== "todos") params.set("demandaRotina", filters.demandaRotina);
    if (filters.status.length > 0) params.set("status", filters.status.join(","));
    if (searchTerm) params.set("busca", searchTerm);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [filters, searchTerm, currentPage, setSearchParams]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Reset para página 1 quando filtros mudarem
    if (currentPage !== 1) {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        params.delete("page");
        return params;
      }, { replace: true });
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("page", page.toString());
      return params;
    }, { replace: true });
  };

  const activeFiltersCount = 
    filters.areas.length + 
    filters.processos.length + 
    filters.subprocessos.length + 
    (filters.produto ? 1 : 0) + 
    (filters.demandaRotina !== "todos" ? 1 : 0) + 
    filters.status.length;

  // Formatar serviços para ServiceCard
  const formattedServicos = servicos.map((servico: any) => ({
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

  const getGridClass = () => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case "list":
        return "space-y-4";
      case "compact":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4";
      case "detailed":
        return "grid grid-cols-1 lg:grid-cols-2 gap-8";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Catálogo de Serviços
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore todos os serviços disponíveis organizados por área, processo e subprocesso.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              Mostrando {servicos.length} de {totalItems} serviços (página {currentPage} de {totalPages})
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <ViewOptions
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showDetails={showDetails}
                onShowDetailsChange={setShowDetails}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar 
              placeholder="Buscar serviços, processos, áreas..."
              className="w-full max-w-2xl"
              onSearchChange={(value) => {
                setSearchParams(prev => {
                  const params = new URLSearchParams(prev);
                  if (value) {
                    params.set("busca", value);
                  } else {
                    params.delete("busca");
                  }
                  return params;
                }, { replace: true });
              }}
            />
          </div>

          {/* Horizontal Filters */}
          {showFilters && (
            <div className="mb-6">
              <HorizontalFilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          )}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="text-center py-12">
            <Square className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca para encontrar o que procura.
            </p>
          </div>
        ) : (
          <>
            <div className={getGridClass()}>
              {formattedServicos.map((servico) => (
                <ServiceCard
                  key={servico.id}
                  service={servico}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}