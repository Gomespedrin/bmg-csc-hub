import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/supabase";

export interface Area { id: string; nome: string; descricao?: string | null; }
export interface Processo { id: string; nome: string; area_id: string; }
export interface Subprocesso { id: string; nome: string; processo_id: string; }
export interface Servico { id: string; produto: string; subprocesso_id: string; o_que_e?: string | null; quem_pode_utilizar?: string | null; }

interface HierarquiaState {
  areas: Area[];
  processos: Processo[];
  subprocessos: Subprocesso[];
  servicos: Servico[];
  loading: boolean;
  error: string | null;
}

const areasCache: Area[] = [];

export function useHierarquia(selected: {
  areaId?: string;
  processoId?: string;
  subprocessoId?: string;
}) {
  const { areaId, processoId, subprocessoId } = selected;
  const [state, setState] = useState<HierarquiaState>({
    areas: [],
    processos: [],
    subprocessos: [],
    servicos: [],
    loading: true,
    error: null
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Áreas
      let areasData = areasCache;
      if (areasCache.length === 0) {
        const { data, error } = await supabase
          .from("areas")
          .select("id, nome, descricao")
          .order("nome");
        if (error) throw error;
        areasData = data || [];
        areasCache.push(...areasData);
      }

      let processosData: Processo[] = [];
      let subprocessosData: Subprocesso[] = [];
      let servicosData: Servico[] = [];

      if (areaId) {
        const { data, error } = await supabase
          .from("processos")
          .select("id, nome, area_id")
          .eq("area_id", areaId)
          .order("nome");
        if (error) throw error;
        processosData = data || [];
      }

      if (processoId) {
        const { data, error } = await supabase
          .from("subprocessos")
          .select("id, nome, processo_id")
          .eq("processo_id", processoId)
          .order("nome");
        if (error) throw error;
        subprocessosData = data || [];
      }

      if (subprocessoId) {
        const { data, error } = await supabase
          .from("servicos")
          .select("id, produto, subprocesso_id, o_que_e, quem_pode_utilizar")
          .eq("subprocesso_id", subprocessoId)
          .order("produto");
        if (error) throw error;
        servicosData = data || [];
      }

      if (!ctrl.signal.aborted) {
        setState({
          areas: areasData,
            processos: processosData,
          subprocessos: subprocessosData,
          servicos: servicosData,
          loading: false,
          error: null
        });
      }
    } catch (e: any) {
      if (ctrl.signal.aborted) return;
      setState(prev => ({ ...prev, loading: false, error: e.message || "Erro ao carregar" }));
    }
  }, [areaId, processoId, subprocessoId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { ...state, reload: load };
}
