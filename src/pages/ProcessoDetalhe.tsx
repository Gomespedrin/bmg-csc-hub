import { useParams, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Clock, Target, FileText, FolderOpen } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProcessoDetalhe() {
  const { processoId } = useParams();
  const { data: areas } = useAreas();

  // Encontrar o processo específico
  const processo = areas?.flatMap(area => 
    area.processos?.map(proc => ({
      ...proc,
      area: area
    })) || []
  ).find(proc => proc.id === processoId);

  if (!processo) {
    return (
      <div className="min-h-screen bg-background">
              <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Processo não encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              O processo solicitado não foi encontrado ou não está disponível.
            </p>
            <Button asChild>
              <Link to="/servicos">Voltar aos Serviços</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const area = processo.area;

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
              <BreadcrumbPage>{processo.nome}</BreadcrumbPage>
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
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {processo.nome}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {processo.descricao || 'Processo da área ' + area?.nome}
              </p>
              
              {/* Stats */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {processo.subprocessos?.length || 0} subprocesso{(processo.subprocessos?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Área: {area?.nome}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subprocessos Grid */}
        {!processo.subprocessos || processo.subprocessos.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum subprocesso encontrado</h3>
            <p className="text-muted-foreground">
              Este processo não possui subprocessos cadastrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processo.subprocessos.map((subprocesso) => (
              <Card key={subprocesso.id} className="group card-elevated hover-lift hover-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-smooth">
                        <Link 
                          to={`/processos/${processo.id}/subprocessos/${subprocesso.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {subprocesso.nome}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <span className="font-medium text-secondary">{area?.nome}</span>
                        {" > "}
                        <span className="text-muted-foreground">{processo.nome}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {subprocesso.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {subprocesso.descricao}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-accent text-accent">
                      Subprocesso
                    </Badge>

                    <Button asChild variant="outline" size="sm" className="group/btn">
                      <Link to={`/processos/${processo.id}/subprocessos/${subprocesso.id}`}>
                        Ver serviços
                        <ArrowLeft className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-smooth rotate-180" />
                      </Link>
                    </Button>
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