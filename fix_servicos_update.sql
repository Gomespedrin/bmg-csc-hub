-- Script para corrigir problemas de atualização de serviços
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status atual
SELECT 'Status atual:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'servicos';

-- 2. Desabilitar RLS temporariamente para permitir atualizações
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se os campos novos existem e estão corretos
SELECT 'Verificando campos:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'servicos' 
AND column_name IN ('sistema_existente', 'status_automatizacao', 'status_validacao', 'link_solicitacao')
ORDER BY column_name;

-- 4. Garantir que as constraints estão corretas
-- Remover constraints problemáticas se existirem
ALTER TABLE public.servicos DROP CONSTRAINT IF EXISTS servicos_status_automatizacao_check;
ALTER TABLE public.servicos DROP CONSTRAINT IF EXISTS servicos_status_validacao_check;

-- Recriar constraints corretas
ALTER TABLE public.servicos ADD CONSTRAINT servicos_status_automatizacao_check 
    CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual'));

ALTER TABLE public.servicos ADD CONSTRAINT servicos_status_validacao_check 
    CHECK (status_validacao IN ('Validado', 'Pendente'));

-- 5. Verificar se há dados para testar
SELECT 'Dados de teste:' as info;
SELECT 
    id, 
    produto, 
    sistema_existente, 
    status_automatizacao, 
    status_validacao, 
    link_solicitacao
FROM servicos 
LIMIT 3;

-- 6. Teste de atualização (substitua o ID por um ID real)
-- UPDATE servicos 
-- SET 
--   sistema_existente = 'ERP Senior',
--   status_automatizacao = 'Automatizado',
--   status_validacao = 'Validado',
--   link_solicitacao = 'https://exemplo.com/solicitar',
--   updated_at = now()
-- WHERE id = 'ID_DO_SERVICO'
-- RETURNING id, produto, sistema_existente, status_automatizacao, status_validacao, link_solicitacao;

-- 7. Verificar resultado
SELECT 'RLS desabilitado temporariamente para permitir atualizações' as status;
SELECT 'Execute o teste de atualização acima com um ID real' as proximo_passo; 