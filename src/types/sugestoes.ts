// src/types/sugestoes.ts
export type SugestaoEscopo = 'area' | 'processo' | 'subprocesso' | 'servico';
export type SugestaoModo = 'novo' | 'edicao';

export interface TempoMedio {
  valor: number;
  unidade: string; // 'h' | 'min' etc.
}

export interface SugestaoDadosV2 {
  meta: {
    form_version: 2;
    modo: SugestaoModo;
    escopo: SugestaoEscopo;
  };
  hierarquia: {
    area_id?: string | null;
    processo_id?: string | null;
    subprocesso_id?: string | null;
    servico_id?: string | null;
  };
  conteudo: {
    nome_sugerido?: string | null;
    descricao?: string | null;
    observacoes?: string | null;
    sla?: number | null;
    sli?: number | null;
    tempo_medio?: TempoMedio | null;
    unidade_medida?: string | null;
    quem_pode_utilizar?: string | null;
    requisitos_operacionais?: string | null;
    demanda_rotina?: 'Demanda' | 'Rotina' | null;
  };
  justificativa: string;
}
