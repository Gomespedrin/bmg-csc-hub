-- Script para limpar duplicatas do usuário Pedro Gomes
-- Execute este script no Supabase SQL Editor

-- 1. Verificar duplicatas
SELECT 
  user_id,
  COUNT(*) as total_duplicatas
FROM public.profiles 
WHERE email = 'gpedrogomes13@gmail.com'
GROUP BY user_id;

-- 2. Manter apenas o perfil mais recente
DELETE FROM public.profiles 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.profiles 
  WHERE email = 'gpedrogomes13@gmail.com'
  GROUP BY user_id
);

-- 3. Verificar resultado
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

-- 4. Verificar total de perfis
SELECT 
  'Total de perfis' as status,
  COUNT(*) as total_profiles
FROM public.profiles; 