import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, TrendingUp, Clock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const mockArea = {
  id: "rh",
  nome: "Recursos Humanos",
  descricao: "A área de Recursos Humanos é responsável pela gestão completa do capital humano da organização, desde o recrutamento e seleção até o desenvolvimento e retenção de talentos. Oferecemos serviços integrados de onboarding, folha de pagamento, treinamento e desenvolvimento organizacional.",
  quantidadeServicos: 23,
  servicosAtivos: 21,
  tempoMedioGeral: "1.5 dias",
  slaGeral: "98%"
};

const mockProcessos = [
  { nome: "Onboarding", servicos: 8, tempoMedio: "3 dias" },
  { nome: "Folha de Pagamento", servicos: 6, tempoMedio: "1 dia" },
  { nome: "Treinamento", servicos: 4, tempoMedio: "2 dias" },
  { nome: "Avaliação de Performance", servicos: 5, tempoMedio: "1 dia" }
];

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
  }
];

export default function AreaDetalhe() {
  const { areaId } = useParams();

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
              <BreadcrumbPage>{mockArea.nome}</BreadcrumbPage>
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
                {mockArea.nome}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {mockArea.descricao}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {mockArea.quantidadeServicos}
                </div>
                <div className="text-sm text-muted-foreground">Total de Serviços</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {mockArea.servicosAtivos}
                </div>
                <div className="text-sm text-muted-foreground">Serviços Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {mockArea.tempoMedioGeral}
                </div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {mockArea.slaGeral}
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
              <div className="grid grid-cols-1 gap-4">
                {mockServicos.map(servico => (
                  <ServiceCard key={servico.id} service={servico} />
                ))}
              </div>
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
                {mockProcessos.map((processo, index) => (
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
                    {index < mockProcessos.length - 1 && (
                      <div className="border-b border-border" />
                    )}
                  </div>
                ))}
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
                  <Link to={`/servicos?area=${mockArea.nome}`}>
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