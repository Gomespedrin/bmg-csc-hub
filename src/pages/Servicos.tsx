import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServicos } from "@/hooks/useServicos";
import { SlidersHorizontal, Grid, List, Search } from "lucide-react";

export default function Servicos() {
  const [filters, setFilters] = useState({
    areas: [],
    processos: [],
    subprocessos: [],
    produto: "",
    demandaRotina: "todos",
    status: []
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const filterPanelRef = useRef<HTMLDivElement>(null);
  
  const { data: servicos, isLoading } = useServicos(filters);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };

    if (filtersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filtersOpen]);

  // Convert servicos data for ServiceCard component
  const formattedServicos = (servicos || []).map(servico => ({
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

  // Filter by search term
  const filteredServicos = formattedServicos.filter(servico =>
    servico.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servico.subprocesso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Catálogo de Serviços
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore todos os serviços disponíveis organizados por área, processo e subprocesso.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                placeholder="Buscar serviços, processos, áreas..."
                showSuggestions={true}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div ref={filterPanelRef} className="mb-6">
              <FilterPanel 
                filters={filters}
                onFiltersChange={setFilters}
                className="max-w-md"
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
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredServicos.length} serviço{filteredServicos.length !== 1 ? 's' : ''} encontrado{filteredServicos.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Services List */}
            {filteredServicos.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredServicos.map(servico => (
                  <ServiceCard key={servico.id} service={servico} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">
                  <svg
                    className="h-full w-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou termos de busca para encontrar o serviço desejado.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      areas: [],
                      processos: [],
                      subprocessos: [],
                      produto: "",
                      demandaRotina: "todos",
                      status: []
                    });
                    setSearchTerm("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}