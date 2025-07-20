// src/hooks/useAreas.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AreaEnriquecida {
  id: string;
  nome: string;
  descricao: string | null;
  servicos_count: number;
  processos_principais: string[];
}

export function useAreas() {
  const [areas, setAreas] = useState<AreaEnriquecida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rawAreas, error: errA } = await supabase
        .from("areas")
        .select("id, nome, descricao");
      if (errA) throw errA;

      const { data: processos } = await supabase
        .from("processos")
        .select("id, nome, area_id");

      const { data: subs } = await supabase
        .from("subprocessos")
        .select("id, nome, processo_id");

      const { data: servicos } = await supabase
        .from("servicos")
        .select("id, status, subprocesso_id");

      // Index
      const procByArea: Record<string, { id: string; nome: string }[]> = {};
      (processos || []).forEach(p => {
        if (!p.area_id) return;
        if (!procByArea[p.area_id]) procByArea[p.area_id] = [];
        procByArea[p.area_id].push({ id: p.id, nome: p.nome });
      });

      const subsByProc: Record<string, { id: string; nome: string }[]> = {};
      (subs || []).forEach(sp => {
        if (!sp.processo_id) return;
        if (!subsByProc[sp.processo_id]) subsByProc[sp.processo_id] = [];
        subsByProc[sp.processo_id].push({ id: sp.id, nome: sp.nome });
      });

      const servBySub: Record<string, { id: string; status: string | null }[]> = {};
      (servicos || []).forEach(sv => {
        if (!sv.subprocesso_id) return;
        if (!servBySub[sv.subprocesso_id]) servBySub[sv.subprocesso_id] = [];
        servBySub[sv.subprocesso_id].push({ id: sv.id, status: sv.status });
      });

      const enriched: AreaEnriquecida[] = (rawAreas || []).map(a => {
        const processosDaArea = procByArea[a.id] || [];
        let totalAtivos = 0;
        const rankingProc: { nome: string; qtd: number }[] = [];

        processosDaArea.forEach(p => {
          const subsDoProc = subsByProc[p.id] || [];
          let qtdProc = 0;
          subsDoProc.forEach(sp => {
            const servs = servBySub[sp.id] || [];
            qtdProc += servs.filter(
              sv => (sv.status || "").toLowerCase() === "ativo"
            ).length;
          });
          if (qtdProc > 0) {
            rankingProc.push({ nome: p.nome, qtd: qtdProc });
            totalAtivos += qtdProc;
          }
        });

        const processosPrincipais = rankingProc
          .sort((a, b) => b.qtd - a.qtd)
          .slice(0, 3)
          .map(r => r.nome);

        return {
          id: a.id,
          nome: a.nome,
          descricao: a.descricao || null,
            servicos_count: totalAtivos,
          processos_principais: processosPrincipais
        };
      });

      setAreas(enriched);
    } catch (e: any) {
      console.error(e);
      setError("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { areas, isLoading: loading, error, refetch: fetchAll };
}
