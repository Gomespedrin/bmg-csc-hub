// src/hooks/useServicos.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ===== Tipos (mantém os que você já tinha) ===== */
export interface ServicoRecord {
  id: string;
  subprocesso_id: string | null;
  produto: string;
  o_que_e: string | null;
  quem_pode_utilizar: string | null;
  tempo_medio: number | null;
  unidade_medida: string | null;
  sla: number | null;
  sli: string | null;
  ano: number | null;
  requisitos_operacionais: string | null;
  observacoes: string | null;
  demanda_rotina: string | null;
  status: string | null;
  versao: number | null;
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
  subprocesso?: {
    id: string;
    nome: string;
    processo?: {
      id: string;
      nome: string;
      area?: {
        id: string;
        nome: string;
      } | null;
    } | null;
  } | null;
}

interface ListaFilters {
  areas: string[];
  processos: string[];
  subprocessos: string[];
  produto: string;
  demandaRotina: string;
  status: string[];
}

export function useServicos(filters: ListaFilters) {
  const [data, setData] = useState<ServicoRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sanitizeArray = (arr: any[]): ServicoRecord[] =>
    (arr || []).filter(
      (item): item is ServicoRecord =>
        !!item && typeof item === "object" && typeof item.produto === "string"
    );

  const fetchLista = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: servicosBase, error: err } = await supabase
        .from("servicos")
        .select("*");

      if (err) {
        console.error(err);
        setError("Erro ao carregar serviços.");
        setData([]);
        setIsLoading(false);
        return;
      }

      // Sanitiza base
      let filtrados = sanitizeArray(servicosBase || []);

      // FILTROS em memória
      if (filters.produto) {
        const term = filters.produto.toLowerCase();
        filtrados = filtrados.filter(s => s.produto?.toLowerCase().includes(term));
      }
      if (filters.demandaRotina) {
        filtrados = filtrados.filter(
          s =>
            (s.demanda_rotina || "").toLowerCase() ===
            filters.demandaRotina.toLowerCase()
        );
      }
      if (filters.status.length > 0) {
        const estados = filters.status.map(s => s.toLowerCase());
        filtrados = filtrados.filter(
          s => s.status && estados.includes(s.status.toLowerCase())
        );
      }

      // (Opcional) Filtragem por área/processo/subprocesso – você pode comentar se não usar
      const precisaJoin =
        filters.areas.length > 0 ||
        filters.processos.length > 0 ||
        filters.subprocessos.length > 0;

      if (precisaJoin) {
        // carrega somente se necessário
        const subIds = [
          ...new Set(filtrados.map(s => s.subprocesso_id).filter(Boolean)),
        ] as string[];

        let mapaSub: Record<
          string,
          { id: string; nome: string; processo_id: string | null }
        > = {};
        if (subIds.length > 0) {
          const { data: subs } = await supabase
            .from("subprocessos")
            .select("id, nome, processo_id")
            .in("id", subIds);
          (subs || []).forEach(sub => (mapaSub[sub.id] = sub));
        }

        const procIds = [
          ...new Set(
            Object.values(mapaSub)
              .map(s => s.processo_id)
              .filter(Boolean)
          ),
        ] as string[];

        let mapaProc: Record<
          string,
          { id: string; nome: string; area_id: string | null }
        > = {};
        if (procIds.length > 0) {
          const { data: procs } = await supabase
            .from("processos")
            .select("id, nome, area_id")
            .in("id", procIds);
          (procs || []).forEach(p => (mapaProc[p.id] = p));
        }

        const areaIds = [
          ...new Set(
            Object.values(mapaProc)
              .map(p => p.area_id)
              .filter(Boolean)
          ),
        ] as string[];

        let mapaArea: Record<string, { id: string; nome: string }> = {};
        if (areaIds.length > 0) {
            const { data: areas } = await supabase
              .from("areas")
              .select("id, nome")
              .in("id", areaIds);
            (areas || []).forEach(a => (mapaArea[a.id] = a));
        }

        // filtros hierárquicos
        if (filters.subprocessos.length > 0) {
          const setSub = new Set(filters.subprocessos);
            filtrados = filtrados.filter(
              s => s.subprocesso_id && setSub.has(s.subprocesso_id)
            );
        }
        if (filters.processos.length > 0) {
          const setProc = new Set(filters.processos);
          filtrados = filtrados.filter(s => {
            if (!s.subprocesso_id) return false;
            const sub = mapaSub[s.subprocesso_id];
            if (!sub?.processo_id) return false;
            return setProc.has(sub.processo_id);
          });
        }
        if (filters.areas.length > 0) {
          const setArea = new Set(filters.areas);
          filtrados = filtrados.filter(s => {
            if (!s.subprocesso_id) return false;
            const sub = mapaSub[s.subprocesso_id];
            if (!sub?.processo_id) return false;
            const proc = mapaProc[sub.processo_id];
            if (!proc?.area_id) return false;
            return setArea.has(proc.area_id);
          });
        }

        // monta hierarquia (sem quebrar se faltar algo)
        filtrados = filtrados.map(s => {
          const sub = s.subprocesso_id ? mapaSub[s.subprocesso_id] : null;
          const proc = sub?.processo_id ? mapaProc[sub.processo_id] : null;
          const area = proc?.area_id ? mapaArea[proc.area_id] : null;
          return {
            ...s,
            subprocesso: sub
              ? {
                  id: sub.id,
                  nome: sub.nome,
                  processo: proc
                    ? {
                        id: proc.id,
                        nome: proc.nome,
                        area: area ? { id: area.id, nome: area.nome } : null,
                      }
                    : null,
                }
              : null,
          };
        });
      }

      setData(filtrados);
    } catch (e: any) {
      console.error(e);
      setError("Erro inesperado ao carregar serviços.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLista();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchLista };
}

/* ====== useServico (detalhe) mantém igual ao anterior ====== */
export interface ServicoDetalhe extends ServicoRecord {
  area_nome?: string | null;
  processo_nome?: string | null;
  subprocesso_nome?: string | null;
}

export function useServico(id: string | undefined) {
  const [servico, setServico] = useState<ServicoDetalhe | null>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchServico = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: base, error: errBase } = await supabase
        .from("servicos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (errBase) {
        setError("Erro ao buscar serviço.");
        setLoading(false);
        return;
      }
      if (!base) {
        setServico(null);
        setLoading(false);
        return;
      }

      let areaNome: string | null = null;
      let processoNome: string | null = null;
      let subprocessoNome: string | null = null;

      if (base.subprocesso_id) {
        const { data: sub } = await supabase
          .from("subprocessos")
          .select("id, nome, processo_id")
          .eq("id", base.subprocesso_id)
          .maybeSingle();
        if (sub) {
          subprocessoNome = sub.nome;
          if (sub.processo_id) {
            const { data: proc } = await supabase
              .from("processos")
              .select("id, nome, area_id")
              .eq("id", sub.processo_id)
              .maybeSingle();
            if (proc) {
              processoNome = proc.nome;
              if (proc.area_id) {
                const { data: area } = await supabase
                  .from("areas")
                  .select("id, nome")
                  .eq("id", proc.area_id)
                  .maybeSingle();
                if (area) areaNome = area.nome;
              }
            }
          }
        }
      }

      setServico({
        ...base,
        area_nome: areaNome,
        processo_nome: processoNome,
        subprocesso_nome: subprocessoNome,
      });
    } catch (e: any) {
      console.error(e);
      setError("Erro inesperado ao carregar serviço.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { servico, loading, error, refetch: fetchServico };
}
