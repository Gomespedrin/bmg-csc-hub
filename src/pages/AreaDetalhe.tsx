import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Package, Users, Clock, Target, TrendingUp, FileText, Settings, Zap } from "lucide-react";
import { useAreas } from "@/hooks/useAreas";
import { useServicos } from "@/hooks/useServicos";
import { createProcessoUrl, createServicoUrl, extractIdFromSlug } from "@/lib/utils";

const AreaDetalhe = () => {
  const { slug } = useParams();
  const { data: areas } = useAreas();
  const { data: servicosData } = useServicos();

  // Extrair o ID da área do slug usando a função existente
  const areaId = slug ? extractIdFromSlug(slug) : '';
  
  // Encontrar a área específica pelo ID extraído
  const area = areas?.find(a => a.id === areaId);
  
  // Filtrar serviços desta área
  const servicosDaArea = (servicosData as any)?.services?.filter((servico: any) => {
    const servicoAreaId = servico.subprocesso?.processo?.area?.id;
    return servicoAreaId === areaId;
  }) || [];

  console.log("🔍 AreaDetalhe - Debug:", {
    slug,
    areaId,
    areasCount: areas?.length,
    areaFound: !!area,
    areaIdFound: area?.id,
    servicosDaAreaCount: servicosDaArea.length
  });

  if (!area) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Área não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            A área que você está procurando não existe ou foi removida.
          </p>
          <Button asChild>
            <Link to="/por-area">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Áreas
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/por-area">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{area.nome}</h1>
                <p className="text-muted-foreground">{area.descricao}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {servicosDaArea.length} serviços
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{servicosDaArea.length}</p>
                  <p className="text-sm text-muted-foreground">Serviços</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{area.processos?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Processos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.5h</p>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processos */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Processos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {area.processos?.map((processo: any) => (
              <Card key={processo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{processo.nome}</CardTitle>
                    <Badge variant="outline">{processo.subprocessos?.length || 0} subprocessos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {processo.descricao || 'Descrição não disponível'}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={createProcessoUrl(processo.nome, processo.id)}>
                      Ver Detalhes
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Serviços */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Serviços Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicosDaArea.map((servico: any) => (
              <Card key={servico.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-2">{servico.produto}</CardTitle>
                    <Badge variant={servico.status === 'ativo' ? 'default' : 'secondary'}>
                      {servico.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {servico.subprocesso?.nome} {'>'} {servico.subprocesso?.processo?.nome}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Tempo: {servico.tempo_medio ? `${Math.ceil(servico.tempo_medio / 60)} dias` : '1 dia'}</span>
                    <span>SLA: {servico.sla ? `${servico.sla}h` : '24h'}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={createServicoUrl(servico.produto, servico.id)}>
                      Ver Detalhes
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDetalhe;