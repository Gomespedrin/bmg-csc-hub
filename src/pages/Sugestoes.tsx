import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/supabase";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SugestaoCard, { SugestaoRecord } from "@/components/sugestoes/SugestaoCard";
import { useToast } from "@/hooks/use-toast";

const Sugestoes = () => {
  const { toast } = useToast();
  const [registros, setRegistros] = useState<SugestaoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [escopoFilter, setEscopoFilter] = useState<string>("todos");
  const [modoFilter, setModoFilter] = useState<string>("todos");
  const [texto, setTexto] = useState("");

  const carregar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sugestoes")
        .select("id, tipo, status, justificativa, dados_sugeridos, created_at, criado_por")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setRegistros(
        (data || []).map(r => ({
          id: r.id,
          tipo: r.tipo,
          status: r.status,
          justificativa: r.justificativa,
          dados_sugeridos: r.dados_sugeridos,
          created_at: r.created_at,
          criado_por: r.criado_por
        }))
      );
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e.message || "Falha ao carregar sugestões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    return registros.filter(r => {
      if (statusFilter !== "todos" && r.status !== statusFilter) return false;
      if (modoFilter !== "todos" && r.tipo !== modoFilter) return false;
      if (escopoFilter !== "todos") {
        const escopo = r.dados_sugeridos?.escopo;
        if (escopo !== escopoFilter) return false;
      }
      if (texto.trim()) {
        const t = texto.toLowerCase();
        const blob = JSON.stringify(r).toLowerCase();
        if (!blob.includes(t)) return false;
      }
      return true;
    });
  }, [registros, statusFilter, escopoFilter, modoFilter, texto]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sugestões</h1>
            <p className="text-muted-foreground">
              Acompanhe as sugestões submetidas (filtro por status / escopo / modo).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={carregar} disabled={loading}>
              Recarregar
            </Button>
            <Button asChild>
              <a href="/sugestoes/nova">Nova Sugestão</a>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar texto..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="reprovado">Reprovado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={escopoFilter} onValueChange={setEscopoFilter}>
            <SelectTrigger><SelectValue placeholder="Escopo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Escopos</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="processo">Processo</SelectItem>
              <SelectItem value="subprocesso">Subprocesso</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>

            <Select value={modoFilter} onValueChange={setModoFilter}>
              <SelectTrigger><SelectValue placeholder="Modo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Modos</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="edicao">Edição</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!loading && filtrados.length === 0 && (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            Nenhuma sugestão encontrada.
          </div>
        )}

        <div className="space-y-4">
          {filtrados.map(s => (
            <SugestaoCard key={s.id} sugestao={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sugestoes;
