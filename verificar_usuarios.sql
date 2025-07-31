-- Script para verificar e criar usuários
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários na tabela auth.users
SELECT 
  'Usuários em auth.users' as status,
  COUNT(*) as total_users
FROM auth.users;

-- 2. Verificar perfis na tabela profiles
SELECT 
  'Perfis em public.profiles' as status,
  COUNT(*) as total_profiles
FROM public.profiles;

-- 3. Verificar usuários específicos
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

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
ORDER BY created_at DESC
LIMIT 10;

-- 5. Criar perfis para todos os usuários que não têm
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
  CASE 
    WHEN au.email = 'gpedrogomes13@gmail.com' THEN 'administrador'
    ELSE 'colaborador'
  END,
  true,
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 6. Verificar resultado final
SELECT 
  'Resultado final' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN perfil = 'administrador' THEN 1 END) as administradores,
  COUNT(CASE WHEN perfil = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles;

-- 7. Mostrar todos os perfis
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
ORDER BY created_at DESC; 