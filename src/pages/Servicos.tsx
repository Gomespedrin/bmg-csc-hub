import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { useServicos } from "@/hooks/useServicos";
import { SlidersHorizontal, Grid, List } from "lucide-react";

export default function Servicos() {
  const [filters, setFilters] = useState({
    areas: [] as string[],
    processos: [] as string[],
    subprocessos: [] as string[],
    produto: "",
    demandaRotina: "",
    status: [] as string[]
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: servicos, isLoading } = useServicos(filters);

  // 1. Limpa itens nulos/undefined
  const base = (servicos || []).filter(Boolean);

  // 2. Formata
  const formattedServicos = base.map(servico => {
    const produto = servico?.produto || "";
    const subprocessoNome = servico?.subprocesso?.nome;
    const processoNome = servico?.subprocesso?.processo?.nome;
    const areaNome = servico?.subprocesso?.processo?.area?.nome;

    return {
      id: servico.id,
      produto,
      subprocesso: subprocessoNome,
      processo: processoNome,
      area: areaNome,
      tempoMedio: servico.tempo_medio
        ? `${servico.tempo_medio} ${servico.unidade_medida || ""}`.trim()
        : "N/A",
      sla: servico.sla
        ? `${servico.sla}${servico.unidade_medida ? " " + servico.unidade_medida : ""}`
        : "N/A",
      status: (servico.status === "ativo" ? "Ativo" : "Inativo") as "Ativo" | "Inativo",
      demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || "Demanda"
    };
  }).filter(s => {
    if (!searchTerm) return true;
    return s.produto.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Título / Subtítulo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Catálogo de Serviços
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Explore todos os serviços disponíveis no Centro de Serviços Compartilhados.
          </p>

          {/* Busca + Controles */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <SearchBar
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(v) => setSearchTerm(v)}
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

        <div className="flex gap-6">
          <FilterPanel
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={formattedServicos.length}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
              </div>
            ) : formattedServicos.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {formattedServicos.map(servico => (
                  <ServiceCard
                    key={servico.id}
                    service={servico}
                    // IMPORTANTE: garantir que ServiceCard use Link interno para detalhe
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
