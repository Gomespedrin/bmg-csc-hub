import { Clock, Target, ArrowRight, Building2, Layers } from "lucide-react";
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
  const statusColor = service.status === "Ativo" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200";
  const servicoUrl = createServicoUrl(service.produto, service.id);

  return (
    <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {service.produto}
            </CardTitle>
          </div>
          <Badge variant={statusVariant} className={`ml-3 flex-shrink-0 ${statusColor} text-xs font-medium`}>
            {service.status}
          </Badge>
        </div>
        
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="font-medium text-secondary">{service.area}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Layers className="h-3 w-3" />
            <span className="text-muted-foreground">{service.processo}</span>
            <span className="text-muted-foreground">•</span>
            <Link 
              to={`/processos/${service.processoId || service.processo}/subprocessos/${service.subprocessoId || service.subprocesso}`}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 underline decoration-dotted underline-offset-2"
            >
              {service.subprocesso}
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <Clock className="h-3 w-3 text-blue-600" />
            <div className="min-w-0">
              <p className="text-blue-600 font-medium">Tempo</p>
              <p className="text-blue-700 truncate">{service.tempoMedio}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
            <Target className="h-3 w-3 text-orange-600" />
            <div className="min-w-0">
              <p className="text-orange-600 font-medium">SLA</p>
              <p className="text-orange-700 truncate">{service.sla}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${
              service.demandaRotina === "Demanda" 
                ? "border-orange-200 text-orange-700 bg-orange-50" 
                : "border-blue-200 text-blue-700 bg-blue-50"
            }`}
          >
            {service.demandaRotina}
          </Badge>

          <Button asChild variant="outline" size="sm" className="group/btn text-xs h-8">
            <Link to={servicoUrl}>
              Ver detalhes
              <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}