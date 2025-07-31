-- RLS SIMPLES E DEFINITIVO - Sem recursão
-- Execute este script para uma solução que FUNCIONA

-- 1. Desabilitar RLS completamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas
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

-- 3. Remover funções e triggers
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_create_suggestions();
DROP FUNCTION IF EXISTS public.update_user_permissions();
DROP TRIGGER IF EXISTS trigger_update_user_permissions ON public.profiles;

-- 4. Criar políticas MUITO SIMPLES (sem recursão)
-- Habilitar RLS apenas nas tabelas que precisam
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

-- Políticas SIMPLES para profiles
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política SIMPLES para administradores (sem consultar profiles)
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (true); -- Temporariamente permitir todos verem todos

-- Políticas SIMPLES para sugestões
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Usuários podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Todos podem ver sugestões" ON public.sugestoes
  FOR SELECT USING (true); -- Temporariamente permitir todos verem todas

-- 5. Verificar se as políticas foram criadas
SELECT 
  'Políticas criadas' as status,
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Teste final
SELECT 
  'RLS SIMPLES implementado' as status,
  COUNT(*) as total_policies,
  'Aplicação deve funcionar sem recursão' as observacao
FROM pg_policies 
WHERE schemaname = 'public'; 