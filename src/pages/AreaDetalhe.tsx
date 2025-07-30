import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, TrendingUp, Clock, Settings } from "lucide-react";
import { useAreaById } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
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
  const [selectedProcesso, setSelectedProcesso] = useState<string | null>(null);
  const { data: servicosData } = useServicos();

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

  // Filtrar serviços da área específica
  const servicos = (servicosData as any)?.services || [];
  const servicosDaArea = servicos.filter((servico: any) => {
    const isFromArea = servico.subprocesso?.processo?.area?.nome === area.nome;
    if (selectedProcesso) {
      return isFromArea && servico.subprocesso?.processo?.nome === selectedProcesso;
    }
    return isFromArea;
  });

  console.log("🔍 AreaDetalhe - Serviços:", {
    totalServicos: servicos.length,
    servicosDaArea: servicosDaArea.length,
    areaNome: area.nome,
    selectedProcesso
  });

  // Formatar serviços para ServiceCard
  const formattedServicos = servicosDaArea.map((servico: any) => ({
    id: servico.id,
    produto: servico.produto,
    subprocesso: servico.subprocesso.nome,
    processo: servico.subprocesso.processo.nome,
    area: servico.subprocesso.processo.area.nome,
    tempoMedio: servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : '1 dia',
    sla: servico.sla ? `${servico.sla} horas` : '24 horas',
    status: (servico.status === 'ativo' ? 'Ativo' : 'Inativo') as "Ativo" | "Inativo",
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda',
    subprocessoId: servico.subprocesso.id,
    processoId: servico.subprocesso.processo.id
  }));

  // Preparar dados dos processos para exibição
  const processos = area.processos?.map(processo => ({
    id: processo.id,
    nome: processo.nome,
    servicos: processo.subprocessos?.reduce((total, subprocesso) => 
      total + (subprocesso.servicos?.length || 0), 0) || 0,
    tempoMedio: "2 dias" // Placeholder - pode ser calculado baseado nos serviços
  })) || [];

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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {area.nome}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {area.descricao || "Descrição da área não disponível."}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{formattedServicos.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Serviços</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{formattedServicos.filter(s => s.status === 'Ativo').length}</div>
                    <div className="text-sm text-muted-foreground">Serviços Ativos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{processos.length}</div>
                    <div className="text-sm text-muted-foreground">Processos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">SLA Geral</div>
                  </div>
                </div>
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
              {formattedServicos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {formattedServicos.map(servico => (
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Processos</CardTitle>
                    <CardDescription>
                      Principais processos desta área
                    </CardDescription>
                  </div>
                  {selectedProcesso && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProcesso(null)}
                    >
                      Limpar Filtro
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {processos.length > 0 ? (
                  processos.map((processo, index) => (
                    <Button
                      key={processo.id}
                      variant={selectedProcesso === processo.nome ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                      onClick={() => setSelectedProcesso(selectedProcesso === processo.nome ? null : processo.nome)}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex-1 text-left">
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
                    </Button>
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
                  <Link to={`/servicos?areas=${encodeURIComponent(area.nome)}`}>
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