-- Script simples para corrigir a coluna modo na tabela sugestoes
-- Execute este script no Supabase Dashboard

-- 1. Adicionar a coluna modo se não existir
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS modo TEXT DEFAULT 'criacao';

-- 2. Atualizar registros existentes que tenham modo NULL
UPDATE public.sugestoes 
SET modo = 'criacao' 
WHERE modo IS NULL;

-- 3. Adicionar constraint para validar valores
ALTER TABLE public.sugestoes 
DROP CONSTRAINT IF EXISTS sugestoes_modo_check;

ALTER TABLE public.sugestoes 
ADD CONSTRAINT sugestoes_modo_check 
CHECK (modo IN ('criacao', 'edicao'));

-- 4. Verificar se funcionou
SELECT 'Verificação final:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
AND column_name = 'modo'; 