import { Clock, Target, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createServicoUrl } from "@/lib/utils";

interface ServiceCardProps {
  service: {
    id: string;
    produto: string;
    subprocesso: string;
    processo: string;
    area: string;
    tempoMedio: string;
    sla: string;
    status: "Ativo" | "Inativo";
    demandaRotina: "Demanda" | "Rotina";
    subprocessoId?: string;
    processoId?: string;
  };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const statusVariant = service.status === "Ativo" ? "default" : "secondary";
  const statusColor = service.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600";
  const servicoUrl = createServicoUrl(service.produto, service.id);

  return (
    <Card className="group card-elevated hover-lift hover-glow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-smooth">
              {service.produto}
            </CardTitle>
            <CardDescription className="text-sm">
              <span className="font-medium text-secondary">{service.area}</span>
              {" > "}
              <span className="text-muted-foreground">{service.processo}</span>
              {" > "}
              <Link 
                to={`/processos/${service.processoId || service.processo}/subprocessos/${service.subprocessoId || service.subprocesso}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {service.subprocesso}
              </Link>
            </CardDescription>
          </div>
          <Badge variant={statusVariant} className={statusColor}>
            {service.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tempo médio:</span>
            <span className="font-medium">{service.tempoMedio}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">SLA:</span>
            <span className="font-medium">{service.sla}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${service.demandaRotina === "Demanda" 
              ? "border-warning text-warning" 
              : "border-accent text-accent"
            }`}
          >
            {service.demandaRotina}
          </Badge>

          <Button asChild variant="outline" size="sm" className="group/btn">
            <Link to={servicoUrl}>
              Ver detalhes
              <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-smooth" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}