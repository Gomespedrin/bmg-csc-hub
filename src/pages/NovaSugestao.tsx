import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase";
import type {
  Area,
  Processo,
  Subprocesso,
  Servico,
  SugestaoEscopo,
  SugestaoModo
} from "@/types";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Hierarquia {
  area?: Area | null;
  processo?: Processo | null;
  subprocesso?: Subprocesso | null;
  servico?: Servico | null;
}

const NovaSugestao = () => {
  const navigate = useNavigate();

  /** =================== ESTADO BÁSICO =================== */
  const [modo, setModo] = useState<SugestaoModo>("novo");
  const [escopo, setEscopo] = useState<SugestaoEscopo>("area");

  const [areas, setAreas] = useState<Area[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [subprocessos, setSubprocessos] = useState<Subprocesso[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [areaId, setAreaId] = useState<string>("");
  const [processoId, setProcessoId] = useState<string>("");
  const [subprocessoId, setSubprocessoId] = useState<string>("");
  const [servicoId, setServicoId] = useState<string>("");

  const [nomeSugerido, setNomeSugerido] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [justificativa, setJustificativa] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);

  const [sucessoId, setSucessoId] = useState<string | null>(null);

  /** =================== CARREGAR LISTAS =================== */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("areas").select("id,nome,descricao").order("nome");
      if (data) setAreas(data as Area[]);
    })();
  }, []);

  useEffect(() => {
    if (!areaId || (modo === "novo" && escopo === "area")) {
      setProcessos([]);
      setProcessoId("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("processos")
        .select("id,nome,area_id")
        .eq("area_id", areaId)
        .order("nome");
      setProcessos((data as Processo[]) || []);
    })();
  }, [areaId, modo, escopo]);

  useEffect(() => {
    if (!processoId || (modo === "novo" && escopo === "processo")) {
      setSubprocessos([]);
      setSubprocessoId("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("subprocessos")
        .select("id,nome,processo_id")
        .eq("processo_id", processoId)
        .order("nome");
      setSubprocessos((data as Subprocesso[]) || []);
    })();
  }, [processoId, modo, escopo]);

  useEffect(() => {
    if (!subprocessoId || (modo === "novo" && escopo === "subprocesso")) {
      setServicos([]);
      setServicoId("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("servicos")
        .select("id,produto as produto,subprocesso_id,status,sla,tempo_medio,unidade_medida,demanda_rotina,created_at")
        .eq("subprocesso_id", subprocessoId)
        .order("produto");
      setServicos((data as Servico[]) || []);
    })();
  }, [subprocessoId, modo, escopo]);

  /** =================== RESET AO MUDAR MODO/ESCOPO =================== */
  useEffect(() => {
    // Se trocar escopo ou modo, limpar ids inválidos e snapshot
    setSnapshot(null);
    setNomeSugerido("");
    setDescricao("");
    setObservacoes("");
    setJustificativa("");

    // Limpa níveis abaixo do alvo de edição/novo
    if (escopo === "area") {
      setAreaId("");
      setProcessoId("");
      setSubprocessoId("");
      setServicoId("");
    } else if (escopo === "processo") {
      setProcessoId("");
      setSubprocessoId("");
      setServicoId("");
    } else if (escopo === "subprocesso") {
      setSubprocessoId("");
      setServicoId("");
    } else if (escopo === "servico") {
      setServicoId("");
    }
  }, [modo, escopo]);

  /** =================== CAPTURAR SNAPSHOT (EDIÇÃO) =================== */
  useEffect(() => {
    if (modo !== "edicao") return;
    const fetchSnapshot = async () => {
      let target: any = null;
      if (escopo === "area" && areaId) {
        const { data } = await supabase.from("areas").select("*").eq("id", areaId).single();
        target = data;
      } else if (escopo === "processo" && processoId) {
        const { data } = await supabase
          .from("processos")
          .select("*, area:areas(id,nome)")
          .eq("id", processoId)
          .single();
        target = data;
      } else if (escopo === "subprocesso" && subprocessoId) {
        const { data } = await supabase
          .from("subprocessos")
          .select("*, processo:processos(id,nome, area:areas(id,nome))")
          .eq("id", subprocessoId)
          .single();
        target = data;
      } else if (escopo === "servico" && servicoId) {
        const { data } = await supabase
          .from("servicos")
          .select("*, subprocesso:subprocessos(id,nome, processo:processos(id,nome, area:areas(id,nome)))")
          .eq("id", servicoId)
          .single();
        target = data;
      }
      setSnapshot(target);
    };
    fetchSnapshot();
  }, [modo, escopo, areaId, processoId, subprocessoId, servicoId]);

  /** =================== VALIDAÇÃO =================== */
  const erroHierarquia = useMemo(() => {
    if (modo === "novo") {
      if (escopo === "processo" && !areaId) return "Selecione a Área para criar o Processo.";
      if (escopo === "subprocesso" && (!areaId || !processoId)) return "Selecione Área e Processo.";
      if (escopo === "servico" && (!areaId || !processoId || !subprocessoId))
        return "Selecione Área, Processo e Subprocesso.";
      return null;
    } else {
      if (escopo === "area" && !areaId) return "Selecione a Área a editar.";
      if (escopo === "processo" && !processoId) return "Selecione o Processo a editar.";
      if (escopo === "subprocesso" && !subprocessoId) return "Selecione o Subprocesso a editar.";
      if (escopo === "servico" && !servicoId) return "Selecione o Serviço a editar.";
      return null;
    }
  }, [modo, escopo, areaId, processoId, subprocessoId, servicoId]);

  /** =================== SUBMIT =================== */
  const handleSubmit = async () => {
    if (erroHierarquia) return;
    if (!justificativa.trim()) return;

    setCarregando(true);

    const payload: any = {
      modo,
      escopo,
      justificativa: justificativa.trim(),
      nome_sugerido: nomeSugerido.trim() || null,
      descricao: descricao.trim() || null,
      observacoes: observacoes.trim() || null,
      status: "pendente"
    };

    // IDs de referência (apenas o necessário conforme escopo)
    if (escopo === "area") {
      if (modo === "edicao") payload.area_id = areaId;
    } else if (escopo === "processo") {
      payload.area_id = areaId;
      if (modo === "edicao") payload.processo_id = processoId;
    } else if (escopo === "subprocesso") {
      payload.area_id = areaId;
      payload.processo_id = processoId;
      if (modo === "edicao") payload.subprocesso_id = subprocessoId;
    } else if (escopo === "servico") {
      payload.area_id = areaId;
      payload.processo_id = processoId;
      payload.subprocesso_id = subprocessoId;
      if (modo === "edicao") payload.servico_id = servicoId;
    }

    if (modo === "edicao" && snapshot) {
      payload.dados_atuais = snapshot;
    }

    const { data, error } = await supabase.from("sugestoes").insert(payload).select("id").single();
    setCarregando(false);

    if (!error && data) {
      setSucessoId(data.id);
      // Limpa somente se quiser nova
      // (não limpar agora para permitir clicar em “Enviar outra”)
    } else {
      alert("Erro ao enviar: " + (error?.message || "desconhecido"));
    }
  };

  const limparParaNova = () => {
    setSucessoId(null);
    setModo("novo");
    setEscopo("area");
    setAreaId("");
    setProcessoId("");
    setSubprocessoId("");
    setServicoId("");
    setNomeSugerido("");
    setDescricao("");
    setObservacoes("");
    setJustificativa("");
    setSnapshot(null);
  };

  /** =================== RENDER HELPERS =================== */
  const renderSelect = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: { id: string; nome: string }[],
    placeholder: string,
    disabled?: boolean
  ) => (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-medium">{label}</Label>
      <select
        className="border rounded px-3 py-2 text-sm bg-white disabled:bg-muted"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  );

  const nomeSugLabelMap: Record<SugestaoEscopo, string> = {
    area: "Nome sugerido da Área (opcional)",
    processo: "Nome sugerido do Processo (opcional)",
    subprocesso: "Nome sugerido do Subprocesso (opcional)",
    servico: "Nome sugerido do Serviço (opcional)"
  };

  /** Qual nível precisa selecionar para NOVO? (superiores) */
  const precisaArea = escopo !== "area";
  const precisaProcesso = escopo !== "area" && escopo !== "processo";
  const precisaSubprocesso = escopo === "servico";

  /** E para EDIÇÃO? Seleciona exatamente o alvo (e superiores para filtro) */
  const edicaoAlvoArea = modo === "edicao" && escopo === "area";
  const edicaoAlvoProcesso = modo === "edicao" && escopo === "processo";
  const edicaoAlvoSub = modo === "edicao" && escopo === "subprocesso";
  const edicaoAlvoServico = modo === "edicao" && escopo === "servico";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Nova Sugestão</h1>

        {/* Modo */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Modo</h2>
            <RadioGroup
              value={modo}
              onValueChange={v => setModo(v as SugestaoModo)}
              className="flex gap-8"
            >
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="novo" /> Novo
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="edicao" /> Edição
              </Label>
            </RadioGroup>
        </div>

        {/* Escopo */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Escopo</h2>
          <RadioGroup
            value={escopo}
            onValueChange={v => setEscopo(v as SugestaoEscopo)}
            className="flex flex-wrap gap-8"
          >
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="area" /> Área
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="processo" /> Processo
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="subprocesso" /> Subprocesso
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="servico" /> Serviço
            </Label>
          </RadioGroup>
        </div>

        {/* Hierarquia */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Hierarquia</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Área */}
            {(modo === "edicao" && escopo === "area") ||
            (modo === "novo" && precisaArea) ||
            (modo === "edicao" && escopo !== "area") ? (
              renderSelect(
                "Área" + (modo === "edicao" && escopo === "area" ? " (alvo)" : ""),
                areaId,
                v => {
                  setAreaId(v);
                  setProcessoId("");
                  setSubprocessoId("");
                  setServicoId("");
                },
                areas,
                "Selecionar",
                modo === "novo" && escopo === "area" // quando criando nova área não precisa escolher outra
              )
            ) : null}

            {/* Processo */}
            {(modo === "edicao" && escopo === "processo") ||
            (modo === "novo" && precisaProcesso) ||
            (modo === "edicao" && escopo.includes("processo") && escopo !== "processo") ||
            (modo === "edicao" && (escopo === "subprocesso" || escopo === "servico")) ? (
              renderSelect(
                "Processo" + (edicaoAlvoProcesso ? " (alvo)" : ""),
                processoId,
                v => {
                  setProcessoId(v);
                  setSubprocessoId("");
                  setServicoId("");
                },
                processos,
                "Selecionar",
                (modo === "novo" && escopo === "processo") || !areaId
              )
            ) : null}

            {/* Subprocesso */}
            {(modo === "edicao" && escopo === "subprocesso") ||
            (modo === "novo" && precisaSubprocesso) ||
            (modo === "edicao" && escopo === "servico") ? (
              renderSelect(
                "Subprocesso" + (edicaoAlvoSub ? " (alvo)" : ""),
                subprocessoId,
                v => {
                  setSubprocessoId(v);
                  setServicoId("");
                },
                subprocessos,
                "Selecionar",
                (modo === "novo" && escopo === "subprocesso") || !processoId
              )
            ) : null}

            {/* Serviço */}
            {escopo === "servico" ? renderSelect(
              "Serviço" + (edicaoAlvoServico ? " (alvo)" : ""),
              servicoId,
              v => setServicoId(v),
              servicos.map(s => ({ id: s.id, nome: s.produto })),
              "Selecionar",
              (modo === "novo" && escopo === "servico") || !subprocessoId
            ) : null}
          </div>

          {erroHierarquia && (
            <p className="mt-4 text-sm text-red-600">{erroHierarquia}</p>
          )}
        </div>

        {/* Dados Atuais (snapshot) */}
        {modo === "edicao" && snapshot && (
          <div className="rounded-lg border bg-card p-6 mb-6">
            <h2 className="font-semibold mb-4">Dados Atuais</h2>
            <pre className="text-xs bg-muted p-3 rounded max-h-64 overflow-auto">
              {JSON.stringify(snapshot, null, 2)}
            </pre>
          </div>
        )}

        {/* Detalhes */}
        <div className="rounded-lg border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Detalhes da Sugestão</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{nomeSugLabelMap[escopo]}</Label>
              <Input
                value={nomeSugerido}
                onChange={e => setNomeSugerido(e.target.value)}
                placeholder={
                  {
                    area: "Ex: Operações",
                    processo: "Ex: Contas a Pagar",
                    subprocesso: "Ex: Triagem de Currículos",
                    servico: "Ex: Publicação de Vaga Interna"
                  }[escopo]
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Descrição / Observação</Label>
              <Textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Detalhe a sugestão..."
                rows={3}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">
                Observações adicionais (opcional)
              </Label>
              <Textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Complementos, riscos, dependências..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Justificativa */}
        <div className="rounded-lg border bg-card p-6 mb-8">
          <h2 className="font-semibold mb-4">Justificativa *</h2>
            <Textarea
              value={justificativa}
              onChange={e => setJustificativa(e.target.value)}
              placeholder="Explique o motivo / benefício / urgência..."
              rows={4}
            />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!!erroHierarquia || carregando}>
            {carregando ? "Enviando..." : "Enviar Sugestão"}
          </Button>
        </div>
      </div>

      {/* Modal Sucesso */}
      <Dialog open={!!sucessoId} onOpenChange={o => !o && setSucessoId(null)}>
        <DialogContent className="sm:max-w-md">
          <h3 className="text-xl font-semibold mb-2">Sugestão enviada!</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Sua sugestão foi registrada com status <strong>pendente</strong>. Em breve será
            avaliada.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={limparParaNova}>
              Enviar outra
            </Button>
            <Button
              onClick={() => {
                const id = sucessoId!;
                setSucessoId(null);
                navigate(`/sugestoes/${id}`);
              }}
            >
              Ver sugestão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaSugestao;
