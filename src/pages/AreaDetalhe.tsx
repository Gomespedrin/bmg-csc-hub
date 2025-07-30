import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, TrendingUp, Clock } from "lucide-react";
import { useAreaById } from "@/hooks/useAreas";
import { extractIdFromSlug, createAreaUrl } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AreaDetalhe() {
  const { slug } = useParams();
  const areaId = slug ? extractIdFromSlug(slug) : "";
  const { data: area, isLoading, error } = useAreaById(areaId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando área...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !area) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Área não encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              A área solicitada não foi encontrada ou não está disponível.
            </p>
            <Button asChild>
              <Link to="/por-area">Voltar às Áreas</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Preparar dados dos processos para exibição
  const processos = area.processos?.map(processo => ({
    nome: processo.nome,
    servicos: processo.subprocessos?.reduce((total, subprocesso) => 
      total + (subprocesso.servicos?.length || 0), 0) || 0,
    tempoMedio: "2 dias" // Placeholder - pode ser calculado baseado nos serviços
  })) || [];

  // Preparar todos os serviços da área
  const todosServicos = area.processos?.flatMap(processo =>
    processo.subprocessos?.flatMap(subprocesso =>
      subprocesso.servicos?.map(servico => ({
        id: servico.id,
        produto: servico.produto,
        subprocesso: subprocesso.nome,
        processo: processo.nome,
        area: area.nome,
        tempoMedio: servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : "1 dia",
        sla: servico.sla ? `${servico.sla} horas` : "24 horas",
        status: servico.status === 'ativo' ? "Ativo" as const : "Inativo" as const,
        demandaRotina: servico.demanda_rotina as "Demanda" | "Rotina"
      })) || []
    ) || []
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/por-area">Áreas</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{area.nome}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/por-area">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Áreas
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 rounded-lg bg-gradient-primary">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {area.nome}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {area.descricao || "Descrição da área não disponível."}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {area.quantidadeServicos}
                </div>
                <div className="text-sm text-muted-foreground">Total de Serviços</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {todosServicos.filter(s => s.status === "Ativo").length}
                </div>
                <div className="text-sm text-muted-foreground">Serviços Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {processos.length}
                </div>
                <div className="text-sm text-muted-foreground">Processos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  98%
                </div>
                <div className="text-sm text-muted-foreground">SLA Geral</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Services */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Serviços da Área
              </h2>
              {todosServicos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {todosServicos.map(servico => (
                    <ServiceCard key={servico.id} service={servico} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhum serviço encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Esta área ainda não possui serviços cadastrados.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Processes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processos</CardTitle>
                <CardDescription>
                  Principais processos desta área
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {processos.length > 0 ? (
                  processos.map((processo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{processo.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {processo.servicos} serviços
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>{processo.tempoMedio}</span>
                          </div>
                        </div>
                      </div>
                      {index < processos.length - 1 && (
                        <div className="border-b border-border" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhum processo cadastrado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" className="w-full" asChild>
                  <Link to="/sugestoes/nova">
                    Sugerir Novo Serviço
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/servicos?area=${area.nome}`}>
                    Ver Todos os Serviços
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}