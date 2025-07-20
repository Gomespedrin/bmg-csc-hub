import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AreaCardProps {
  area: {
    id: string;
    nome: string;
    descricao?: string | null;
    servicosCount?: number;
    servicos_count?: number;
    processosPrincipais?: string[];        // camelCase
    processos_principais?: string[];       // snake_case
  };
  className?: string;
}

export function AreaCard({ area, className }: AreaCardProps) {
  // Normaliza contagem
  const totalServicos =
    typeof area.servicosCount === "number"
      ? area.servicosCount
      : typeof area.servicos_count === "number"
      ? area.servicos_count
      : 0;

  // Normaliza lista de processos principais
  const processos =
    Array.isArray(area.processosPrincipais) && area.processosPrincipais.length > 0
      ? area.processosPrincipais
      : Array.isArray(area.processos_principais) && area.processos_principais.length > 0
      ? area.processos_principais
      : [];

  const descricao =
    (area.descricao && area.descricao.trim().length > 0
      ? area.descricao
      : "Área sem descrição cadastrada.") || "Área sem descrição cadastrada.";

  return (
    <Card className={`group hover-lift hover-glow transition-smooth ${className || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle
              className="text-lg font-semibold group-hover:text-primary transition-smooth line-clamp-2"
              title={area.nome}
            >
              {area.nome}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {descricao}
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="text-xs font-medium border-primary/30 text-primary bg-primary/5"
          >
            {totalServicos} {totalServicos === 1 ? "serviço" : "serviços"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">
            PRINCIPAIS PROCESSOS
          </p>
          {processos.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Nenhum processo destacado.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {processos.slice(0, 5).map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-1 rounded-full bg-muted font-medium text-foreground/80"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button asChild variant="outline" size="sm" className="group/btn">
            <Link to={`/por-area?id=${area.id}`}>
              Ver serviços
              <span className="ml-1 group-hover/btn:translate-x-0.5 transition-smooth">
                →
              </span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
