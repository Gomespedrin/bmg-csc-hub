import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
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
  
  const { data: servicos, isLoading } = useServicos(filters);

  // Convert servicos data for ServiceCard component
  const formattedServicos = (servicos || []).map(servico => ({
    id: servico.id,
    produto: servico.produto,
    subprocesso: servico.subprocesso.nome,
    processo: servico.subprocesso.processo.nome,
    area: servico.subprocesso.processo.area.nome,
    tempoMedio: servico.tempo_medio ? `${servico.tempo_medio} min` : 'N/A',
    sla: servico.sla ? `${servico.sla}h` : 'N/A',
    status: (servico.status === 'ativo' ? 'Ativo' : 'Inativo') as "Ativo" | "Inativo",
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda'
  }));

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
            resultCount={formattedServicos.length}
          />

          {/* Services Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
              </div>
            ) : formattedServicos.length > 0 ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {formattedServicos.map(servico => (
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