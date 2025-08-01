-- Teste específico para atualização de serviços
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está desabilitado
SELECT 'Verificando RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'servicos';

-- 2. Desabilitar RLS se estiver habilitado
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;

-- 3. Verificar campos existentes
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

-- 4. Pegar um serviço para teste
SELECT 'Serviço para teste:' as info;
SELECT 
    id, 
    produto, 
    sistema_existente, 
    status_automatizacao, 
    status_validacao, 
    link_solicitacao,
    created_at,
    updated_at
FROM servicos 
LIMIT 1;

-- 5. Teste de atualização (execute apenas se houver dados)
-- Substitua o ID pelo ID real do serviço retornado acima
/*
UPDATE servicos 
SET 
  sistema_existente = 'ERP Senior Teste',
  status_automatizacao = 'Automatizado',
  status_validacao = 'Validado',
  link_solicitacao = 'https://teste.com/solicitar',
  updated_at = now()
WHERE id = 'ID_DO_SERVICO_AQUI'
RETURNING id, produto, sistema_existente, status_automatizacao, status_validacao, link_solicitacao, updated_at;
*/

-- 6. Verificar se a atualização funcionou
SELECT 'Verificando após atualização:' as info;
SELECT 
    id, 
    produto, 
    sistema_existente, 
    status_automatizacao, 
    status_validacao, 
    link_solicitacao,
    updated_at
FROM servicos 
WHERE id = 'ID_DO_SERVICO_AQUI'; -- Substitua pelo ID usado no teste

-- 7. Status final
SELECT 'RLS desabilitado e teste concluído' as status; 