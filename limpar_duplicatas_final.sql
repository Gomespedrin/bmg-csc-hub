-- Script final para limpar duplicatas e testar
-- Execute este script no Supabase SQL Editor

-- 1. Verificar duplicatas antes
SELECT 
  'ANTES - Duplicatas encontradas' as status,
  user_id,
  COUNT(*) as total_duplicatas
FROM public.profiles 
WHERE email = 'gpedrogomes13@gmail.com'
GROUP BY user_id;

-- 2. Manter apenas o perfil mais recente (com ID maior)
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.profiles 
  WHERE email = 'gpedrogomes13@gmail.com'
  GROUP BY user_id
);

-- 3. Verificar resultado após limpeza
SELECT 
  'DEPOIS - Perfil único' as status,
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

-- 4. Verificar total de perfis
SELECT 
  'Total de perfis no sistema' as status,
  COUNT(*) as total_profiles
FROM public.profiles;

-- 5. Teste de consulta que a aplicação faz
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
ORDER BY nome;

-- 6. Verificar se RLS está desabilitado
SELECT 
  'RLS Status' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles'; 