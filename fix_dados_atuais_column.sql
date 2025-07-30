-- Script para corrigir a coluna dados_atuais na tabela sugestoes
-- Execute este script no Supabase Dashboard

-- 1. Verificar se a coluna dados_atuais existe
SELECT 'Verificando coluna dados_atuais:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
AND column_name = 'dados_atuais';

-- 2. Se a coluna não existir, adicionar
ALTER TABLE public.sugestoes
ADD COLUMN IF NOT EXISTS dados_atuais JSONB DEFAULT '{}'::jsonb;

-- 3. Se existir mas for NOT NULL, alterar para permitir NULL ou definir default
ALTER TABLE public.sugestoes 
ALTER COLUMN dados_atuais SET DEFAULT '{}'::jsonb;

-- 4. Atualizar registros existentes que tenham dados_atuais NULL
UPDATE public.sugestoes 
SET dados_atuais = '{}'::jsonb 
WHERE dados_atuais IS NULL;

-- 5. Verificar se funcionou
SELECT 'Verificação final dados_atuais:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
AND column_name = 'dados_atuais'; 