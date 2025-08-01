import { useParams, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Target, Users, FileText, AlertCircle, CheckCircle, Zap, Link as LinkIcon, Download, Paperclip } from "lucide-react";
import { useServicoById } from "@/hooks/useServicos";
import { useAnexos } from "@/hooks/useAdmin";
import { extractIdFromSlug, createAreaUrl } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ServicoDetalhe() {
  const { slug } = useParams();
  const servicoId = slug ? extractIdFromSlug(slug) : "";
  const { data: servico, isLoading, error } = useServicoById(servicoId);
  const { data: anexos, isLoading: anexosLoading } = useAnexos(servicoId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando serviço...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !servico) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Serviço não encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              O serviço solicitado não foi encontrado ou não está disponível.
            </p>
            <Button asChild>
              <Link to="/servicos">Voltar aos Serviços</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const area = servico.subprocesso?.processo?.area;
  const processo = servico.subprocesso?.processo;
  const subprocesso = servico.subprocesso;

  return (
    <div className="min-h-screen bg-background">
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
                <Link to={`/areas/${area?.id}`}>{area?.nome}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/processos/${processo?.id}`}>{processo?.nome}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/processos/${processo?.id}/subprocessos/${subprocesso?.id}`}>{subprocesso?.nome}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{servico.produto}</BreadcrumbPage>
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
                {servico.produto}
              </h1>
              <p className="text-lg text-muted-foreground">
                {area?.nome} • {processo?.nome} • {subprocesso?.nome}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge 
                variant={servico.status === "ativo" ? "default" : "secondary"}
                className={servico.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
              >
                {servico.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${servico.demanda_rotina === "Demanda" 
                  ? "border-warning text-warning" 
                  : "border-accent text-accent"
                }`}
              >
                {servico.demanda_rotina}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)}` : "1"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {servico.unidade_medida || "dias"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {servico.sla || "24"}
                </div>
                <div className="text-sm text-muted-foreground">SLA (horas)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {servico.sli || "95"}%
                </div>
                <div className="text-sm text-muted-foreground">SLI</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {servico.ano || "2024"}
                </div>
                <div className="text-sm text-muted-foreground">Ano</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* O que é */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>O que é</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {servico.o_que_e || "Descrição não disponível."}
                </p>
              </CardContent>
            </Card>

            {/* Quem pode utilizar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Quem pode utilizar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {servico.quem_pode_utilizar || "Informação não disponível."}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos Operacionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Requisitos Operacionais</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {servico.requisitos_operacionais || "Requisitos não especificados."}
                </p>
                {anexosLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando anexos...</p>
                  </div>
                ) : anexos && anexos.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-foreground">Anexos:</h4>
                                         {anexos.map((anexo) => (
                       <div key={anexo.id} className="flex items-center justify-between p-2 border rounded-lg">
                         <div className="flex items-center space-x-2">
                           <Paperclip className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm font-medium">{anexo.nome}</span>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => window.open(anexo.url, '_blank')}
                           className="h-8 w-8 p-0"
                         >
                           <Download className="h-4 w-4" />
                         </Button>
                       </div>
                     ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum anexo disponível.</p>
                )}
              </CardContent>
            </Card>

            {/* Sistema Existente */}
            {servico.sistema_existente && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Está em algum sistema?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {servico.sistema_existente}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status de Automação */}
            {servico.status_automatizacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Status Automação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline" 
                    className={`${
                      servico.status_automatizacao === "Automatizado" 
                        ? "border-green-200 text-green-700 bg-green-50" 
                        : servico.status_automatizacao === "Planejado"
                        ? "border-blue-200 text-blue-700 bg-blue-50"
                        : "border-orange-200 text-orange-700 bg-orange-50"
                    }`}
                  >
                    {servico.status_automatizacao}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Status de Validação */}
            {servico.status_validacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Status de Validação pela Área</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge 
                      variant="outline" 
                      className={`${
                        servico.status_validacao === "Validado" 
                          ? "border-green-200 text-green-700 bg-green-50" 
                          : "border-orange-200 text-orange-700 bg-orange-50"
                      }`}
                    >
                      {servico.status_validacao}
                    </Badge>
                    {servico.data_ultima_validacao && (
                      <p className="text-sm text-muted-foreground">
                        Última validação: {new Date(servico.data_ultima_validacao).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Link de Solicitação */}
            {servico.link_solicitacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LinkIcon className="h-5 w-5" />
                    <span>Onde Solicitar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <a href={servico.link_solicitacao} target="_blank" rel="noopener noreferrer">
                      Acessar Sistema
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {servico.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Observações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {servico.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" className="w-full" asChild>
                  <Link to="/sugestoes/nova">
                    Sugerir Melhoria
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/areas/${area?.id}`}>
                    Ver Outros Serviços da Área
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Área</h4>
                  <p className="text-sm text-muted-foreground">{area?.nome}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Processo</h4>
                  <p className="text-sm text-muted-foreground">{processo?.nome}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Subprocesso</h4>
                  <p className="text-sm text-muted-foreground">{subprocesso?.nome}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Status</h4>
                  <Badge 
                    variant={servico.status === "ativo" ? "default" : "secondary"}
                    className={servico.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {servico.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}