export type Area = {
  id: string;
  nome: string;
  descricao?: string | null;
  created_at?: string;
};

export type Processo = {
  id: string;
  nome: string;
  area_id: string;
  area?: Area;
};

export type Subprocesso = {
  id: string;
  nome: string;
  processo_id: string;
  processo?: Processo;
};

export type Servico = {
  id: string;
  produto: string;
  status?: string | null;
  subprocesso_id: string;
  subprocesso?: Subprocesso;
  sla?: number | null;
  tempo_medio?: number | null;
  unidade_medida?: string | null;
  demanda_rotina?: string | null;
  created_at?: string;
};

/** Escopos possíveis de sugestão */
export type SugestaoEscopo = "area" | "processo" | "subprocesso" | "servico";
/** Modo: criar algo novo ou editar um existente */
export type SugestaoModo = "novo" | "edicao";

export interface Sugestao {
  id: string;
  modo: SugestaoModo;
  escopo: SugestaoEscopo;
  status: "pendente" | "aprovada" | "reprovada";
  area_id?: string | null;
  processo_id?: string | null;
  subprocesso_id?: string | null;
  servico_id?: string | null;
  nome_sugerido?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  justificativa: string;
  dados_atuais?: any; // snapshot opcional
  criado_por?: string | null;
  created_at?: string;
  updated_at?: string;
}
