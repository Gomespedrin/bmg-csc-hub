import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { AreaCard } from "@/components/areas/AreaCard";
import { SearchBar } from "@/components/search/SearchBar";
import { useAreas } from "@/hooks/useAreas";
import { Building2 } from "lucide-react";

export default function PorArea() {
  const { areas, isLoading } = useAreas();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtra por nome ou descrição
  const filteredAreas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();
    if (!areas || areas.length === 0) return [];
    if (!termo) return areas;
    return areas.filter(a =>
      a.nome.toLowerCase().includes(termo) ||
      (a.descricao || "").toLowerCase().includes(termo)
    );
  }, [areas, searchTerm]);

  // Soma total de serviços ativos (segundo hook)
  const totalServicos = useMemo(
    () => (areas || []).reduce((sum, a) => sum + (a.servicos_count || 0), 0),
    [areas]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-10">
        {/* Cabeçalho */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Serviços por Área
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore os serviços organizados por área de atuação. Cada área
            agrupa processos e subprocessos com seus respectivos serviços.
          </p>

            {/* Métricas */}
            <div className="flex flex-wrap justify-center gap-10 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {areas?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Áreas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">
                  {totalServicos}
                </p>
                <p className="text-sm text-muted-foreground">Serviços Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">100%</p>
                <p className="text-sm text-muted-foreground">
                  Disponibilidade*
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-6 mb-6">
              *Indicador provisório – será substituído por cálculo real depois.
            </p>

          {/* Busca */}
          <div className="max-w-md mx-auto mb-4">
            <SearchBar
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={setSearchTerm}
              showSuggestions={false}
            />
          </div>
        </div>

        {/* Grid de Áreas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando áreas...</p>
          </div>
        ) : filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map(area => (
              <AreaCard
                key={area.id}
                area={{
                  id: area.id,
                  nome: area.nome,
                  descricao: area.descricao || "",
                  servicosCount: area.servicos_count,
                  processosPrincipais: area.processos_principais
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma área encontrada
            </h3>
            <p className="text-muted-foreground">
              Ajuste o termo de busca e tente novamente.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
