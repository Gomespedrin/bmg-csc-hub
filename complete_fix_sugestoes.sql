-- Script completo para corrigir a tabela sugestoes

-- 1. Verificar estrutura atual
SELECT 'Estrutura atual da tabela sugestoes:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar todas as colunas necessárias
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS tipo TEXT;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS dados_sugeridos JSONB;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS justificativa TEXT;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS comentario_admin TEXT;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS criado_por UUID;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS aprovado_por UUID;

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Adicionar constraints
ALTER TABLE public.sugestoes 
DROP CONSTRAINT IF EXISTS sugestoes_tipo_check;

ALTER TABLE public.sugestoes 
ADD CONSTRAINT sugestoes_tipo_check 
CHECK (tipo IN ('novo', 'edicao'));

ALTER TABLE public.sugestoes 
DROP CONSTRAINT IF EXISTS sugestoes_status_check;

ALTER TABLE public.sugestoes 
ADD CONSTRAINT sugestoes_status_check 
CHECK (status IN ('pendente', 'aprovada', 'rejeitada'));

-- 4. Adicionar comentários
COMMENT ON COLUMN public.sugestoes.tipo IS 'Tipo da sugestão: novo ou edicao';
COMMENT ON COLUMN public.sugestoes.dados_sugeridos IS 'Dados sugeridos pelo usuário (JSONB)';
COMMENT ON COLUMN public.sugestoes.justificativa IS 'Justificativa da sugestão';
COMMENT ON COLUMN public.sugestoes.status IS 'Status da sugestão: pendente, aprovada, rejeitada';
COMMENT ON COLUMN public.sugestoes.comentario_admin IS 'Comentário do administrador';
COMMENT ON COLUMN public.sugestoes.criado_por IS 'ID do usuário que criou a sugestão';
COMMENT ON COLUMN public.sugestoes.aprovado_por IS 'ID do administrador que aprovou/rejeitou';

-- 5. Verificar estrutura final
SELECT 'Estrutura final da tabela sugestoes:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar constraints
SELECT 'Constraints da tabela sugestoes:' as info;
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%sugestoes%';

-- 7. Verificar se RLS está habilitado
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'sugestoes';

-- 8. Verificar políticas RLS
SELECT 'Políticas RLS:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'sugestoes'; 