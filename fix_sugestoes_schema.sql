-- Script para corrigir o schema da tabela sugestoes

-- 1. Verificar a estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar a coluna tipo se não existir
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS tipo TEXT;

-- 3. Adicionar constraint para a coluna tipo
ALTER TABLE public.sugestoes 
DROP CONSTRAINT IF EXISTS sugestoes_tipo_check;

ALTER TABLE public.sugestoes 
ADD CONSTRAINT sugestoes_tipo_check 
CHECK (tipo IN ('novo', 'edicao'));

-- 4. Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.sugestoes.tipo IS 'Tipo da sugestão: novo ou edicao';

-- 5. Verificar se a estrutura está correta agora
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar as constraints da tabela
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%sugestoes%';

-- 7. Testar inserção (execute como usuário autenticado)
-- INSERT INTO public.sugestoes (
--   tipo,
--   dados_sugeridos,
--   justificativa,
--   criado_por,
--   status
-- ) VALUES (
--   'novo',
--   '{"teste": "dados"}'::jsonb,
--   'Teste após correção do schema',
--   auth.uid(),
--   'pendente'
-- ); 