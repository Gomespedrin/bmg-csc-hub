import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/search/SearchBar";
import { ServiceCard } from "@/components/services/ServiceCard";
import { AreaCard } from "@/components/areas/AreaCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, Zap, Users, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-portal-csc.jpg";

const featuredServicos = [
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
    produto: "Deploy de Aplicação",
    subprocesso: "CI/CD",
    processo: "Desenvolvimento de Sistemas",
    area: "Tecnologia da Informação",
    tempoMedio: "30 min",
    sla: "2 horas", 
    status: "Ativo" as const,
    demandaRotina: "Demanda" as const
  }
];

const featuredAreas = [
  {
    id: "rh",
    nome: "Recursos Humanos",
    descricao: "Gestão de pessoas, onboarding, folha de pagamento e desenvolvimento organizacional.",
    quantidadeServicos: 23,
    processos: ["Onboarding", "Folha de Pagamento", "Treinamento"]
  },
  {
    id: "ti", 
    nome: "Tecnologia da Informação",
    descricao: "Desenvolvimento de sistemas, infraestrutura, suporte técnico e segurança da informação.",
    quantidadeServicos: 31,
    processos: ["Desenvolvimento", "Infraestrutura", "Suporte"]
  }
];

const Index = () => {
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
              <div className="text-3xl font-bold text-primary mb-2">133</div>
              <div className="text-sm text-muted-foreground">Serviços Ativos</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-secondary flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-secondary mb-2">6</div>
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
              Conheça alguns dos serviços mais utilizados e bem avaliados do nosso catálogo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {featuredServicos.map(servico => (
              <ServiceCard key={servico.id} service={servico} />
            ))}
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
            {featuredAreas.map(area => (
              <AreaCard key={area.id} area={area} />
            ))}
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
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Tem uma sugestão de melhoria?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Colabore conosco! Sugira novos serviços ou melhorias nos processos existentes.
          </p>
          <Button asChild size="lg" variant="secondary" className="hover-lift">
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
