import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { AreaCard } from "@/components/areas/AreaCard";
import { AreaSearchBar } from "@/components/search/AreaSearchBar";
import { AreaFilterPanel } from "@/components/filters/AreaFilterPanel";
import { ViewOptions, ViewMode } from "@/components/ui/view-options";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Building2 } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";

export default function PorArea() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showDetails, setShowDetails] = useState(false);

  // Inicializar filtros a partir da URL
  const [filters, setFilters] = useState({
    areas: searchParams.get("areas")?.split(",").filter(Boolean) || [],
  });

  const searchTerm = searchParams.get("busca") || "";

  const { data: areas, isLoading } = useAreas();
  
  // Filtrar e ordenar áreas
  const filteredAreas = (areas || [])
    .filter(area =>
      area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(area => 
      filters.areas.length === 0 || filters.areas.includes(area.nome)
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const totalServicos = (areas || []).reduce((sum, area) => sum + (area.quantidadeServicos || 0), 0);

  const handleSearchChange = (value: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (value) {
        params.set("busca", value);
      } else {
        params.delete("busca");
      }
      return params;
    }, { replace: true });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (newFilters.areas.length > 0) {
        params.set("areas", newFilters.areas.join(","));
      } else {
        params.delete("areas");
      }
      return params;
    }, { replace: true });
  };

  const activeFiltersCount = filters.areas.length;

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
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Serviços por Área
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore os serviços organizados por área de atuação. 
            Cada área contém processos específicos com seus respectivos serviços.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{areas?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Áreas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalServicos}</div>
              <div className="text-sm text-muted-foreground">Serviços</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
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
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <AreaFilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            className="mb-6"
          />
        )}

        {/* Search */}
        <div className="mb-6">
          <AreaSearchBar
            placeholder="Buscar área..."
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando áreas...</p>
          </div>
        ) : filteredAreas.length > 0 ? (
          <div className={getGridClass()}>
            {filteredAreas.map((area) => (
              <AreaCard key={area.id} area={area} viewMode={viewMode} showDetails={showDetails} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma área encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca para encontrar o que procura.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}