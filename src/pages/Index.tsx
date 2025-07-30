import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { ServiceCard } from "@/components/services/ServiceCard";
import { AreaCard } from "@/components/areas/AreaCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, Zap, Users, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";
import heroImage from "@/assets/hero-portal-csc.jpg";

const Index = () => {
  const { data: servicosData, isLoading: servicosLoading } = useServicos();
  const { data: areas, isLoading: areasLoading } = useAreas();

  // Extrair dados dos serviços
  const servicos = (servicosData as any)?.services || [];
  const totalServicos = (servicosData as any)?.totalItems || 0;

  // Convert servicos data for ServiceCard component
  const formattedServicos = servicos.map((servico: any) => ({
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

  const featuredServicos = formattedServicos.slice(0, 2);
  const featuredAreas = areas?.slice(0, 2) || [];
  const totalAreas = areas?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-16 lg:py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 99, 0, 0.9), rgba(70, 42, 113, 0.8)), url(${heroImage})`
        }}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Portal <span className="text-accent">CSC</span>
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Centralize, consulte e gerencie todos os serviços do Centro de Serviços Compartilhados do Grupo BMG
          </p>
          
          {/* Main Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar 
              placeholder="Buscar serviços, processos, áreas..."
              className="w-full"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-primary">
              <Link to="/por-area">
                <Search className="mr-2 h-5 w-5" />
                Explorar por Área
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-lift">
              <Link to="/servicos">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">{totalServicos}</div>
              <div className="text-sm text-muted-foreground">Serviços Ativos</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-secondary flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-secondary mb-2">{totalAreas}</div>
              <div className="text-sm text-muted-foreground">Áreas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">98%</div>
              <div className="text-sm text-muted-foreground">SLA Cumprido</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-warning/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning mb-2">2.5h</div>
              <div className="text-sm text-muted-foreground">Tempo Médio</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Serviços em Destaque
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conheça alguns dos principais serviços disponíveis no nosso catálogo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {servicosLoading ? (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
              </div>
            ) : featuredServicos.length > 0 ? (
              featuredServicos.map(servico => (
                <ServiceCard key={servico.id} service={servico} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
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
                  Nenhum serviço disponível
                </h3>
                <p className="text-muted-foreground">
                  Ainda não há serviços cadastrados no sistema.
                </p>
              </div>
            )}
          </div>

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

      {/* Featured Areas */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Principais Áreas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore os serviços organizados por área de especialização.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {areasLoading ? (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Carregando áreas...</p>
              </div>
            ) : featuredAreas.length > 0 ? (
              featuredAreas.map(area => (
                <AreaCard 
                  key={area.id} 
                  area={{
                    id: area.id,
                    nome: area.nome,
                    descricao: area.descricao || '',
                    quantidadeServicos: area.quantidadeServicos || 0,
                    processos: area.processos?.map((p: any) => p.nome) || []
                  }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma área disponível
                </h3>
                <p className="text-muted-foreground">
                  Ainda não há áreas cadastradas no sistema.
                </p>
              </div>
            )}
          </div>

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

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground mb-4">
                Precisa de um novo serviço?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Não encontrou o que procurava? Sugira um novo serviço para nossa equipe avaliar e implementar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="glow-primary">
                <Link to="/sugestoes/nova">
                  Sugerir Novo Serviço
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
