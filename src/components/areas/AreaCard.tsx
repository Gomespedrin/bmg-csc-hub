import { Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createAreaUrl } from "@/lib/utils";

interface AreaCardProps {
  area: {
    id: string;
    nome: string;
    descricao?: string;
    quantidadeServicos: number;
    processos: any[];
    icone?: string;
  };
  viewMode?: "grid" | "list" | "compact" | "detailed";
  showDetails?: boolean;
}

const getAreaIcon = (areaName: string) => {
  // Icons can be customized based on area name
  return Building2;
};

export function AreaCard({ area }: AreaCardProps) {
  const IconComponent = getAreaIcon(area.nome);
  const areaUrl = createAreaUrl(area.nome, area.id);

  return (
    <Card className="group card-elevated hover-lift hover-glow cursor-pointer">
      <Link to={areaUrl}>
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-smooth">
                {area.nome}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {area.descricao}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {area.quantidadeServicos} serviços
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="group/btn h-8 px-2">
              Ver serviços
              <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-smooth" />
            </Button>
          </div>

          {area.processos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Principais Processos
              </p>
              <div className="flex flex-wrap gap-1">
                {area.processos.slice(0, 3).map((processo, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-muted-foreground/20 text-muted-foreground"
                  >
                    {typeof processo === 'string' ? processo : processo.nome}
                  </Badge>
                ))}
                {area.processos.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-muted-foreground/20 text-muted-foreground"
                  >
                    +{area.processos.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}