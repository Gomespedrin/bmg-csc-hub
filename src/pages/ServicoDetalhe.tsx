import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Target, Users, FileText, AlertCircle, CheckCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const mockServico = {
  id: "1",
  produto: "Abertura de Conta PJ",
  subprocesso: "Onboarding",
  processo: "Gestão de Novos Clientes",
  area: "Recursos Humanos",
  tempoMedio: "2 dias",
  unidadeMedida: "dias úteis",
  sla: "5 dias",
  sli: "95%",
  ano: "2024",
  status: "Ativo",
  demandaRotina: "Demanda",
  oQueE: "Serviço responsável pela abertura de contas para pessoas jurídicas, incluindo validação de documentos, análise de risco e ativação da conta no sistema.",
  quemPodeUtilizar: "Todas as agências e canais digitais autorizados para abertura de contas PJ. Gerentes de relacionamento e analistas comerciais.",
  requisitosOperacionais: "Documentação completa da empresa (CNPJ, Contrato Social, etc.), sistema CRM atualizado, acesso ao módulo de abertura de contas.",
  observacoes: "Em casos de empresas de alto risco, é necessário aprovação adicional do comitê de crédito. Documentos digitalizados devem ter qualidade mínima de 300 DPI."
};

export default function ServicoDetalhe() {
  const { id } = useParams();

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
                <Link to="/por-area">{mockServico.area}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{mockServico.processo}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{mockServico.subprocesso}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mockServico.produto}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/servicos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Serviços
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {mockServico.produto}
              </h1>
              <p className="text-lg text-muted-foreground">
                {mockServico.area} • {mockServico.processo} • {mockServico.subprocesso}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge 
                variant={mockServico.status === "Ativo" ? "default" : "secondary"}
                className={mockServico.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
              >
                {mockServico.status}
              </Badge>
              <Badge 
                variant="outline" 
                className={mockServico.demandaRotina === "Demanda" 
                  ? "border-warning text-warning" 
                  : "border-accent text-accent"
                }
              >
                {mockServico.demandaRotina}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* O que é */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>O que é</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {mockServico.oQueE}
                </p>
              </CardContent>
            </Card>

            {/* Quem pode utilizar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-secondary" />
                  <span>Quem pode utilizar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {mockServico.quemPodeUtilizar}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos Operacionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Requisitos Operacionais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {mockServico.requisitosOperacionais}
                </p>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span>Observações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {mockServico.observacoes}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acordos com Clientes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acordos com Clientes</CardTitle>
                <CardDescription>Métricas e compromissos de qualidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tempo Médio</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{mockServico.tempoMedio}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Unidade de Medida</span>
                  <span className="text-sm">{mockServico.unidadeMedida}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">SLA</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">{mockServico.sla}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SLI</span>
                  <Badge variant="outline" className="border-accent text-accent">
                    {mockServico.sli}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">ANO</span>
                  <span className="text-sm">{mockServico.ano}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/sugestoes/nova">
                    Sugerir Melhoria
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full">
                  Reportar Problema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}