-- Script para debugar problemas de autenticação
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se há usuários na tabela auth.users
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email = 'gpedrogomes13@gmail.com' THEN 1 END) as pedro_gomes_exists
FROM auth.users;

-- 2. Verificar usuários específicos
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'gpedrogomes13@gmail.com'
ORDER BY created_at DESC;

-- 3. Verificar perfis existentes
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN email = 'gpedrogomes13@gmail.com' THEN 1 END) as pedro_gomes_profile
FROM public.profiles;

-- 4. Verificar perfis específicos
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
WHERE email = 'gpedrogomes13@gmail.com'
ORDER BY created_at DESC;

-- 5. Verificar se há problemas de duplicação
SELECT 
  user_id,
  COUNT(*) as profile_count
FROM public.profiles 
WHERE email = 'gpedrogomes13@gmail.com'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 6. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 7. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 8. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY policyname;

-- 9. Teste de inserção direta (se RLS estiver desabilitado)
-- Descomente as linhas abaixo se necessário para testar
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
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'gpedrogomes13@gmail.com' LIMIT 1),
  'Pedro Gomes',
  'gpedrogomes13@gmail.com',
  'administrador',
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  perfil = 'administrador',
  ativo = true,
  updated_at = now();
*/

-- 10. Verificar se há constraints que possam estar causando problemas
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass; 