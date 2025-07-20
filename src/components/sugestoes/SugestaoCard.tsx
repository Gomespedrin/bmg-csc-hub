import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface SugestaoRecord {
  id: string;
  tipo: "novo" | "edicao";
  status: string;
  justificativa: string;
  dados_sugeridos: any;
  created_at: string;
  criado_por?: string | null;
}

function statusColor(status: string) {
  switch (status) {
    case "aprovado": return "bg-green-100 text-green-700";
    case "reprovado": return "bg-red-100 text-red-700";
    default: return "bg-amber-100 text-amber-700";
  }
}

const SugestaoCard = ({ sugestao }: { sugestao: SugestaoRecord }) => {
  const escopo = sugestao.dados_sugeridos?.escopo;
  const modo = sugestao.tipo;
  const created = formatDistanceToNow(new Date(sugestao.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-lg">
            {modo === "novo" ? "Nova" : "Edição"} {escopo ? escopo.charAt(0).toUpperCase() + escopo.slice(1) : ""}
          </CardTitle>
          <Badge className={statusColor(sugestao.status)} variant="outline">
            {sugestao.status}
          </Badge>
          <Badge variant="secondary">{modo}</Badge>
          {escopo && <Badge variant="outline">{escopo}</Badge>}
        </div>
        <CardDescription>
          Criado {created}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="font-medium">Justificativa: </span>
          <span>{sugestao.justificativa}</span>
        </div>
        {modo === "edicao" && sugestao.dados_sugeridos?.dados_atuais && (
          <details className="bg-muted/50 rounded p-3">
            <summary className="cursor-pointer font-medium mb-2">Dados Atuais</summary>
            <pre className="text-xs overflow-auto">
{JSON.stringify(sugestao.dados_sugeridos.dados_atuais, null, 2)}
            </pre>
          </details>
        )}
        {sugestao.dados_sugeridos?.proposta && (
          <details className="bg-muted/30 rounded p-3">
            <summary className="cursor-pointer font-medium mb-2">
              Proposta
            </summary>
            <pre className="text-xs overflow-auto">
{JSON.stringify(sugestao.dados_sugeridos.proposta, null, 2)}
            </pre>
          </details>
        )}
        {/* Botões de ação (futuros - somente admin) */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" disabled>
            Aprovar
          </Button>
          <Button size="sm" variant="outline" disabled>
            Reprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SugestaoCard;
