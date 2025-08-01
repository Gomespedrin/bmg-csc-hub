-- Script para testar funcionalidade de anexos
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para testes
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se a tabela de anexos existe
SELECT 
  'Verificando tabela de anexos:' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'anexos'
ORDER BY ordinal_position;

-- 3. Verificar se há serviços para testar
SELECT 
  'Serviços disponíveis para teste:' as info,
  id,
  produto,
  requisitos_operacionais
FROM servicos 
LIMIT 3;

-- 4. Teste de inserção de anexo (substitua o ID pelo ID real de um serviço)
-- INSERT INTO public.anexos (servico_id, nome, url, tipo, tamanho)
-- VALUES (
--   'ID_DO_SERVICO_AQUI', -- Substitua pelo ID real
--   'documento_teste.pdf',
--   'https://exemplo.com/documento.pdf',
--   'application/pdf',
--   1024000
-- )
-- RETURNING id, servico_id, nome, url, tipo, tamanho, created_at;

-- 5. Verificar anexos existentes
SELECT 
  'Anexos existentes:' as info,
  id,
  servico_id,
  nome,
  tipo,
  tamanho,
  created_at
FROM anexos 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Status final
SELECT 'RLS desabilitado e teste concluído' as status; 