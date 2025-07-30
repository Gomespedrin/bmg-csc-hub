-- Adicionar coluna dados_sugeridos na tabela sugestoes
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS dados_sugeridos JSONB;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.sugestoes.dados_sugeridos IS 'Dados sugeridos pelo usuário para a sugestão (JSONB)'; 