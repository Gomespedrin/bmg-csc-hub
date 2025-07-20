import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { ServiceCard } from "@/components/services/ServiceCard";
import { AreaCard } from "@/components/areas/AreaCard";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  Users,
  Zap,
  TrendingUp
} from "lucide-react";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";
import heroImage from "@/assets/hero-portal-csc.jpg";

const Index = () => {
  const navigate = useNavigate();

  /* ===================== BUSCAS ===================== */
  const { data: servicosData, isLoading: servicosLoading } = useServicos({
    areas: [],
    processos: [],
    subprocessos: [],
    produto: "",
    demandaRotina: "",
    status: []
  });
  const { areas, isLoading: areasLoading } = useAreas();

  const [searchTerm, setSearchTerm] = useState("");

  /* ===================== SANITIZAÇÃO ===================== */
  const safeServicos = useMemo(
    () =>
      (servicosData || []).filter(
        (s) =>
          s &&
          typeof s === "object" &&
          typeof s.produto === "string" &&
          s.id
      ),
    [servicosData]
  );

  /* ===================== DERIVADOS ===================== */
  const servicosAtivos = useMemo(
    () => safeServicos.filter(s => (s.status || "").toLowerCase() === "ativo"),
    [safeServicos]
  );

  const destaque = useMemo(
    () =>
      servicosAtivos.slice(0, 3).map(s => ({
        id: s.id,
        produto: s.produto || "(Sem nome)",
        subprocesso: s.subprocesso?.nome || null,
        processo: s.subprocesso?.processo?.nome || null,
        area: s.subprocesso?.processo?.area?.nome || null,
        tempoMedio: s.tempo_medio
          ? `${s.tempo_medio} ${s.unidade_medida || ""}`.trim()
          : "N/A",
        sla: s.sla
          ? `${s.sla}${s.unidade_medida ? " " + s.unidade_medida : ""}`
          : "N/A",
        status: "Ativo" as "Ativo",
        demandaRotina: (s.demanda_rotina as "Demanda" | "Rotina") || "Demanda"
      })),
    [servicosAtivos]
  );

  // Ordena áreas (mesmo sem serviços) – mostra top 4, se nenhuma tiver serviços mostra 1.
  const areasOrdenadas = useMemo(
    () => [...(areas || [])].sort((a, b) => b.servicos_count - a.servicos_count),
    [areas]
  );

  const principaisAreas = useMemo(() => {
    const com = areasOrdenadas.filter(a => a.servicos_count > 0);
    if (com.length > 0) return com.slice(0, 4);
    return areasOrdenadas.slice(0, 1);
  }, [areasOrdenadas]);

  /* ===================== MÉTRICAS ===================== */
  const totalServicosAtivos = servicosAtivos.length;
  const totalAreasAtendidas = (areas || []).filter(a => a.servicos_count > 0).length;
  const slaCumpridoPercent =
    totalServicosAtivos === 0
      ? 0
      : Math.round(
          (servicosAtivos.filter(s => s.sla !== null && s.sla !== undefined).length /
            totalServicosAtivos) *
            100
        );

  const tempoMedioHoras = (() => {
    if (servicosAtivos.length === 0) return null;
    const valores: number[] = [];
    servicosAtivos.forEach(s => {
      if (s.tempo_medio && s.tempo_medio > 0) {
        const unidade = (s.unidade_medida || "").toLowerCase();
        let horas = s.tempo_medio;
        if (unidade.startsWith("min")) horas = s.tempo_medio / 60;
        if (unidade.startsWith("hora")) horas = s.tempo_medio;
        valores.push(horas);
      }
    });
    if (valores.length === 0) return null;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  })();

  const tempoMedioFormatado =
    tempoMedioHoras === null
      ? "—"
      : tempoMedioHoras < 1
      ? `${Math.round(tempoMedioHoras * 60)} min`
      : `${tempoMedioHoras.toFixed(1)} h`;

  /* ===================== HANDLERS ===================== */
  const handleSearchSubmit = () => {
    if (searchTerm.trim()) navigate("/servicos");
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO (layout antigo restaurado) */}
      <section
        className="relative overflow-hidden pt-24 pb-20"
        style={{
          backgroundImage: `
            linear-gradient(120deg, rgba(255,115,0,0.85), rgba(95,50,160,0.75)),
            url(${heroImage})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
              Portal <span className="text-accent">CSC</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Centralize, consulte e gerencie todos os serviços do Centro de
              Serviços Compartilhados do Grupo BMG.
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="Buscar serviços, processos, áreas..."
                value={searchTerm}
                onChange={setSearchTerm}
                onEnter={handleSearchSubmit}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="hover-lift font-medium"
                onClick={() => navigate("/por-area")}
              >
                Explorar por Área
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="hover-lift font-medium bg-white text-foreground border border-border"
              >
                <Link to="/servicos">
                  Ver Todos os Serviços
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* MÉTRICAS – faixa branca como no print antigo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/15 flex items-center justify-center">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {servicosLoading ? "…" : totalServicosAtivos}
              </div>
              <div className="text-sm text-foreground/70">Serviços Ativos</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-secondary/15 flex items-center justify-center">
                <Users className="h-7 w-7 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-secondary mb-2">
                {areasLoading ? "…" : totalAreasAtendidas}
              </div>
              <div className="text-sm text-foreground/70">Áreas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/15 flex items-center justify-center">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">
                {servicosLoading ? "…" : `${slaCumpridoPercent}%`}
              </div>
              <div className="text-sm text-foreground/70">SLA Cumprido*</div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-warning/15 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning mb-2">
                {servicosLoading ? "…" : tempoMedioFormatado}
              </div>
              <div className="text-sm text-foreground/70">Tempo Médio*</div>
            </div>
          </div>
          <p className="text-[10px] text-foreground/50 text-center mt-6">
            *Métricas provisórias – serão refinadas com dados reais.
          </p>
        </div>
      </section>

      {/* SERVIÇOS EM DESTAQUE */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Serviços em Destaque
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Alguns serviços ativos do catálogo.
            </p>
          </div>

          {servicosLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando serviços...
            </div>
          ) : destaque.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">
                Nenhum serviço ativo cadastrado ainda.
              </p>
              <Button asChild variant="outline">
                <Link to="/sugestoes/nova">
                  Sugerir Primeiro Serviço
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {destaque.map(s => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/servicos">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PRINCIPAIS ÁREAS */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Principais Áreas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore os serviços organizados por área de especialização.
            </p>
          </div>

          {areasLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando áreas...
            </div>
          ) : principaisAreas.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground mb-4">
                Nenhuma área cadastrada ainda.
              </p>
              <Button asChild variant="outline">
                <Link to="/sugestoes/nova">
                  Sugerir Serviço
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {principaisAreas.map(area => (
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
          )}

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/por-area">
                Ver Todas as Áreas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA SUGESTÃO */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Tem uma sugestão de melhoria?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Sugira novos serviços ou melhorias nos processos existentes.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/sugestoes/nova">
              Fazer Sugestão
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
