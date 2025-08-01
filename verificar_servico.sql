-- Script para verificar se o serviço existe
-- Execute este script no Supabase SQL Editor

-- Verificar se o serviço com ID específico existe
SELECT 
  'Verificando serviço específico' as status,
  id,
  produto,
  status,
  created_at
FROM public.servicos 
WHERE id = '14c9e879-2c67-4977-b79e-788cfa437830';

-- Verificar todos os serviços para debug
SELECT 
  'Todos os serviços' as status,
  COUNT(*) as total_servicos,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
  COUNT(CASE WHEN status = 'inativo' THEN 1 END) as inativos
FROM public.servicos;

-- Verificar alguns serviços de exemplo
SELECT 
  'Exemplos de serviços' as status,
  id,
  produto,
  status
FROM public.servicos 
LIMIT 5;

-- Verificar se há problemas com subprocessos
SELECT 
  'Verificando subprocessos' as status,
  COUNT(*) as total_subprocessos
FROM public.subprocessos;

-- Verificar relacionamentos
SELECT 
  'Verificando relacionamentos' as status,
  s.id as servico_id,
  s.produto,
  s.subprocesso_id,
  sp.nome as subprocesso_nome
FROM public.servicos s
LEFT JOIN public.subprocessos sp ON s.subprocesso_id = sp.id
WHERE s.id = '14c9e879-2c67-4977-b79e-788cfa437830'; 

-- Verificar status da tabela de serviços
-- 1. Verificar se RLS está habilitado/desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'servicos';

-- 2. Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'servicos';

-- 3. Verificar se os campos novos existem
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'servicos' 
AND column_name IN ('sistema_existente', 'status_automatizacao', 'status_validacao', 'link_solicitacao')
ORDER BY column_name;

-- 4. Verificar constraints dos campos
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'servicos' 
AND kcu.column_name IN ('status_automatizacao', 'status_validacao');

-- 5. Teste de inserção simples (comentado para segurança)
-- INSERT INTO servicos (produto, subprocesso_id, sistema_existente, status_automatizacao, status_validacao, link_solicitacao)
-- VALUES ('Teste', 'ID_DO_SUBPROCESSO', 'ERP Senior', 'Automatizado', 'Validado', 'https://teste.com')
-- RETURNING id, produto, sistema_existente, status_automatizacao, status_validacao, link_solicitacao;

-- 6. Verificar se há dados de teste
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
LIMIT 5; 