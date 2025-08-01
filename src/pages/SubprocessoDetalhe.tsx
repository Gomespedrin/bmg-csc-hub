import React from "react";
import { useParams, Link } from "react-router-dom";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Package, Users, Clock, Target, TrendingUp, FileText, Settings, Zap, FolderOpen } from "lucide-react";
import { useServicos } from "@/hooks/useServicos";
import { useAreas } from "@/hooks/useAreas";
import { createAreaUrl, createProcessoUrl, createServicoUrl, extractIdFromSlug } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function SubprocessoDetalhe() {
  const { processoId, subprocessoId } = useParams();
  const { data: areas } = useAreas();
  const { data: servicosData } = useServicos();

  // Extrair os IDs dos slugs usando a função existente
  const extractedProcessoId = processoId ? extractIdFromSlug(processoId) : '';
  const extractedSubprocessoId = subprocessoId ? extractIdFromSlug(subprocessoId) : '';

  console.log("🔍 SubprocessoDetalhe - Parâmetros:", { 
    processoId, 
    subprocessoId,
    extractedProcessoId,
    extractedSubprocessoId
  });

  // Encontrar o subprocesso específico pelo ID extraído
  const subprocesso = areas?.flatMap(area => 
    area.processos?.flatMap(processo => 
      processo.subprocessos?.map(subprocesso => ({
        ...subprocesso,
        processo: processo,
        area: area
      })) || []
    ) || []
  ).find(sub => sub.id === extractedSubprocessoId);

  console.log("🔍 SubprocessoDetalhe - Subprocesso encontrado:", subprocesso);

  // Filtrar serviços deste subprocesso
  const servicos = (servicosData as any)?.services || [];
  const servicosDoSubprocesso = servicos.filter((servico: any) => {
    const servicoSubprocessoId = servico.subprocesso?.id;
    return servicoSubprocessoId === extractedSubprocessoId;
  });

  console.log("🔍 SubprocessoDetalhe - Serviços:", {
    totalServicos: servicos.length,
    servicosDoSubprocesso: servicosDoSubprocesso.length,
    subprocessoId: subprocesso?.id
  });

  if (!subprocesso) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando subprocesso...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!subprocesso) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Subprocesso não encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              O subprocesso solicitado não foi encontrado ou não está disponível.
            </p>
            <Button asChild>
              <Link to="/servicos">Voltar aos Serviços</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const area = subprocesso.area;
  const processo = subprocesso.processo;

  // Formatar serviços para ServiceCard
  const formattedServicos = servicosDoSubprocesso.map((servico: any) => ({
    id: servico.id,
    produto: servico.produto,
    subprocesso: servico.subprocesso.nome,
    processo: servico.subprocesso.processo.nome,
    area: servico.subprocesso.processo.area.nome,
    tempoMedio: servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : '1 dia',
    sla: servico.sla ? `${servico.sla} horas` : '24 horas',
    status: (servico.status === 'ativo' ? 'Ativo' : 'Inativo') as "Ativo" | "Inativo",
    demandaRotina: (servico.demanda_rotina as "Demanda" | "Rotina") || 'Demanda',
    sistemaExistente: servico.sistema_existente,
    statusAutomatizacao: servico.status_automatizacao,
    statusValidacao: servico.status_validacao,
    linkSolicitacao: servico.link_solicitacao
  }));

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
                <Link to={createAreaUrl(area?.nome || '', area?.id || '')}>{area?.nome}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={createProcessoUrl(processo?.nome || '', processo?.id || '')}>{processo?.nome}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subprocesso.nome}</BreadcrumbPage>
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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {subprocesso.nome}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {subprocesso.descricao || 'Subprocesso da área ' + area?.nome}
                </p>
                
                {/* Stats */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formattedServicos.length} serviço{formattedServicos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Área: {area?.nome} {'>'} {processo?.nome}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services - Layout em Lista */}
        {formattedServicos.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground">
              Este subprocesso não possui serviços cadastrados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formattedServicos.map((servico) => (
              <Card key={servico.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{servico.produto}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium text-secondary">{servico.area}</span>
                          {" > "}
                          <span className="text-muted-foreground">{servico.processo}</span>
                          {" > "}
                          <span className="text-muted-foreground">{servico.subprocesso}</span>
                        </p>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Tempo médio: <span className="font-medium">{servico.tempoMedio}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              SLA: <span className="font-medium">{servico.sla}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={servico.status === "Ativo" ? "default" : "secondary"}
                          className={servico.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                        >
                          {servico.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${servico.demandaRotina === "Demanda" 
                            ? "border-warning text-warning" 
                            : "border-accent text-accent"
                          }`}
                        >
                          {servico.demandaRotina}
                        </Badge>
                        {servico.statusValidacao && (
                          <Badge
                            variant="outline"
                            className={`${
                              servico.statusValidacao === "Validado"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-orange-200 text-orange-700 bg-orange-50"
                            }`}
                          >
                            {servico.statusValidacao}
                          </Badge>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link to={createServicoUrl(servico.produto, servico.id)}>
                          Ver detalhes
                          <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 