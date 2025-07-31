-- Script completo para corrigir a recursão infinita
-- Execute este script no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para evitar loops
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_historico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Superadministradores podem gerenciar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem gerenciar perfis" ON public.profiles;

DROP POLICY IF EXISTS "Todos podem visualizar áreas" ON public.areas;
DROP POLICY IF EXISTS "Administradores podem gerenciar áreas" ON public.areas;

DROP POLICY IF EXISTS "Todos podem visualizar processos" ON public.processos;
DROP POLICY IF EXISTS "Administradores podem gerenciar processos" ON public.processos;

DROP POLICY IF EXISTS "Todos podem visualizar subprocessos" ON public.subprocessos;
DROP POLICY IF EXISTS "Administradores podem gerenciar subprocessos" ON public.subprocessos;

DROP POLICY IF EXISTS "Todos podem visualizar serviços ativos" ON public.servicos;
DROP POLICY IF EXISTS "Administradores podem gerenciar serviços" ON public.servicos;

DROP POLICY IF EXISTS "Administradores podem ver histórico" ON public.servicos_historico;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Colaboradores podem criar sugestões" ON public.sugestoes;

-- 3. Remover funções problemáticas
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_create_suggestions();

-- 4. Verificar se o usuário Pedro Gomes existe e tem perfil
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.id as profile_id,
  p.perfil,
  p.ativo
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'gpedrogomes13@gmail.com';

-- 5. Garantir que o usuário Pedro Gomes tenha perfil de administrador
INSERT INTO public.profiles (
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  au.id,
  'Pedro Gomes',
  au.email,
  'administrador',
  true,
  now(),
  now()
FROM auth.users au
WHERE au.email = 'gpedrogomes13@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = au.id
);

-- 6. Atualizar perfil existente se necessário
UPDATE public.profiles 
SET 
  perfil = 'administrador',
  ativo = true,
  updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'gpedrogomes13@gmail.com'
);

-- 7. Verificar resultado
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
WHERE email = 'gpedrogomes13@gmail.com';

-- 8. Criar políticas simples e seguras
-- Habilitar RLS novamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (simples e sem recursão)
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores verem todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para outras tabelas (leitura pública)
CREATE POLICY "Todos podem visualizar áreas" ON public.areas
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar processos" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar subprocessos" ON public.subprocessos
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar serviços" ON public.servicos
  FOR SELECT USING (true);

-- Políticas para sugestões
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Usuários podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (criado_por = auth.uid());

-- 9. Verificar se tudo está funcionando
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10. Teste final
SELECT 
  'Teste concluído' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN perfil = 'administrador' THEN 1 END) as administradores
FROM public.profiles; 