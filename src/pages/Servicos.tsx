import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid, List } from "lucide-react";

const mockServicos = [
  {
    id: "1",
    produto: "Abertura de Conta PJ",
    subprocesso: "Onboarding",
    processo: "Gestão de Novos Clientes", 
    area: "Recursos Humanos",
    tempoMedio: "2 dias",
    sla: "5 dias",
    status: "Ativo" as const,
    demandaRotina: "Demanda" as const
  },
  {
    id: "2",
    produto: "Processamento de Folha",
    subprocesso: "Cálculo de Salários",
    processo: "Folha de Pagamento",
    area: "Recursos Humanos", 
    tempoMedio: "1 dia",
    sla: "2 dias",
    status: "Ativo" as const,
    demandaRotina: "Rotina" as const
  },
  {
    id: "3",
    produto: "Deploy de Aplicação",
    subprocesso: "CI/CD",
    processo: "Desenvolvimento de Sistemas",
    area: "Tecnologia da Informação",
    tempoMedio: "30 min",
    sla: "2 horas", 
    status: "Ativo" as const,
    demandaRotina: "Demanda" as const
  },
  {
    id: "4",
    produto: "Backup de Dados",
    subprocesso: "Backup Automático",
    processo: "Infraestrutura",
    area: "Tecnologia da Informação",
    tempoMedio: "4 horas",
    sla: "6 horas",
    status: "Ativo" as const,
    demandaRotina: "Rotina" as const
  },
  {
    id: "5",
    produto: "Análise de Contratos",
    subprocesso: "Revisão Legal",
    processo: "Gestão de Contratos",
    area: "Jurídico",
    tempoMedio: "3 dias",
    sla: "5 dias",
    status: "Inativo" as const,
    demandaRotina: "Demanda" as const
  }
];

export default function Servicos() {
  const [filters, setFilters] = useState({
    areas: [],
    processos: [],
    subprocessos: [],
    produto: "",
    demandaRotina: "",
    status: []
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter services based on current filters
  const filteredServicos = mockServicos.filter(servico => {
    if (filters.areas.length > 0 && !filters.areas.includes(servico.area)) return false;
    if (filters.processos.length > 0 && !filters.processos.includes(servico.processo)) return false;
    if (filters.subprocessos.length > 0 && !filters.subprocessos.includes(servico.subprocesso)) return false;
    if (filters.produto && !servico.produto.toLowerCase().includes(filters.produto.toLowerCase())) return false;
    if (filters.demandaRotina && servico.demandaRotina !== filters.demandaRotina) return false;
    if (filters.status.length > 0 && !filters.status.includes(servico.status)) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Catálogo de Serviços
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore todos os serviços disponíveis no Centro de Serviços Compartilhados.
          </p>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <SearchBar placeholder="Buscar serviços..." />
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
              
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Filter Panel */}
          <FilterPanel
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={filteredServicos.length}
          />

          {/* Services Grid/List */}
          <div className="flex-1">
            {filteredServicos.length > 0 ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredServicos.map(servico => (
                  <ServiceCard key={servico.id} service={servico} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca para encontrar os serviços desejados.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}