import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import type { Sugestao } from "@/types";

const SugestaoDetalhe = () => {
  const { id } = useParams();
  const [sug, setSug] = useState<Sugestao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("sugestoes")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setSug(data as Sugestao);
      setLoading(false);
    })();
  }, [id]);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {loading && <p>Carregando...</p>}
        {!loading && !sug && <p>Não encontrado.</p>}
        {sug && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Sugestão #{sug.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium">{sug.status}</span> • Modo: {sug.modo} • Escopo: {sug.escopo}
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-card">
              <h2 className="font-semibold mb-2">Hierarquia / IDs</h2>
              <ul className="text-sm space-y-1">
                <li>Área: {sug.area_id || "—"}</li>
                <li>Processo: {sug.processo_id || "—"}</li>
                <li>Subprocesso: {sug.subprocesso_id || "—"}</li>
                <li>Serviço: {sug.servico_id || "—"}</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4 bg-card">
              <h2 className="font-semibold mb-2">Detalhes da Sugestão</h2>
              <p><span className="font-medium">Nome sugerido:</span> {sug.nome_sugerido || "—"}</p>
              <p className="mt-2 whitespace-pre-wrap">
                <span className="font-medium">Descrição:</span>{" "}
                {sug.descricao || "—"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                <span className="font-medium">Observações:</span>{" "}
                {sug.observacoes || "—"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                <span className="font-medium">Justificativa:</span>{" "}
                {sug.justificativa}
              </p>
            </div>

            {sug.dados_atuais && (
              <div className="rounded-lg border p-4 bg-card">
                <h2 className="font-semibold mb-2">Dados Atuais (Snapshot)</h2>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-80">
                  {JSON.stringify(sug.dados_atuais, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <Button asChild variant="outline">
                <Link to="/sugestoes/nova">Nova sugestão</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SugestaoDetalhe;
