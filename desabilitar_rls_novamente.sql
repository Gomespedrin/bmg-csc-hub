-- Script para desabilitar RLS novamente
-- Execute este script para resolver a recursão infinita

-- 1. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;

DROP POLICY IF EXISTS "Todos podem visualizar áreas" ON public.areas;
DROP POLICY IF EXISTS "Administradores podem gerenciar áreas" ON public.areas;

DROP POLICY IF EXISTS "Todos podem visualizar processos" ON public.processos;
DROP POLICY IF EXISTS "Administradores podem gerenciar processos" ON public.processos;

DROP POLICY IF EXISTS "Todos podem visualizar subprocessos" ON public.subprocessos;
DROP POLICY IF EXISTS "Administradores podem gerenciar subprocessos" ON public.subprocessos;

DROP POLICY IF EXISTS "Todos podem visualizar serviços" ON public.servicos;
DROP POLICY IF EXISTS "Administradores podem gerenciar serviços" ON public.servicos;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Usuários podem criar sugestões" ON public.sugestoes;

-- 3. REMOVER funções problemáticas
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_create_suggestions();

-- 4. Verificar se RLS está desabilitado
SELECT 
  'RLS Status' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'areas', 'processos', 'subprocessos', 'servicos', 'sugestoes')
ORDER BY tablename;

-- 5. Verificar se não há políticas ativas
SELECT 
  'Políticas ativas' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- 6. Teste de consulta
SELECT 
  'Teste de consulta' as status,
  COUNT(*) as total_profiles
FROM public.profiles;

-- 7. Mensagem final
SELECT 
  'RLS DESABILITADO - Aplicação deve funcionar' as status,
  'Recarregue a aplicação para testar' as instrucao; 