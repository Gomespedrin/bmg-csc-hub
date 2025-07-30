-- Script para verificar e corrigir a coluna modo na tabela sugestoes
-- Execute este script no Supabase Dashboard

-- 1. Verificar estrutura atual da tabela
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

-- 2. Verificar se a coluna modo existe e suas constraints
SELECT 'Constraints da coluna modo:' as info;
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%modo%';

-- 3. Se a coluna modo não existir, adicionar
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS modo TEXT;

-- 4. Se a coluna modo existir mas não tiver valor padrão, adicionar
ALTER TABLE public.sugestoes 
ALTER COLUMN modo SET DEFAULT 'criacao';

-- 5. Adicionar constraint para a coluna modo se não existir
ALTER TABLE public.sugestoes 
DROP CONSTRAINT IF EXISTS sugestoes_modo_check;

ALTER TABLE public.sugestoes 
ADD CONSTRAINT sugestoes_modo_check 
CHECK (modo IN ('criacao', 'edicao'));

-- 6. Atualizar registros existentes que tenham modo NULL
UPDATE public.sugestoes 
SET modo = 'criacao' 
WHERE modo IS NULL;

-- 7. Verificar estrutura final
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

-- 8. Verificar constraints finais
SELECT 'Constraints finais:' as info;
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%sugestoes%'; 