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