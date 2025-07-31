-- Script para verificar e corrigir a tabela de usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_exists;

-- 2. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar se há usuários na tabela profiles
SELECT COUNT(*) as total_users FROM public.profiles;

-- 4. Verificar usuários existentes
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar se há usuários na auth.users sem perfil
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN p.id IS NULL THEN 'SEM PERFIL' ELSE 'COM PERFIL' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- 6. Criar perfis para usuários que não têm (se necessário)
-- Descomente as linhas abaixo se precisar criar perfis para usuários sem perfil

/*
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
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.email,
  'colaborador',
  true,
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;
*/

-- 7. Verificar políticas RLS da tabela profiles
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Criar políticas RLS se não existirem
-- Política para usuários verem seus próprios dados
CREATE POLICY IF NOT EXISTS "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para administradores gerenciarem todos os usuários
CREATE POLICY IF NOT EXISTS "Administradores podem gerenciar usuários" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- 9. Verificar resultado final
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
  COUNT(CASE WHEN perfil = 'administrador' THEN 1 END) as administradores,
  COUNT(CASE WHEN perfil = 'superadministrador' THEN 1 END) as super_administradores
FROM public.profiles; 