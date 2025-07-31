-- Script para verificar e corrigir o perfil do usuário atual
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o usuário atual existe
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE id = auth.uid();

-- 2. Verificar se já existe um perfil para o usuário atual
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. Se não existir perfil, criar um
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
  auth.uid(),
  COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  ),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  'administrador', -- Definir como administrador para resolver o problema de acesso
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
);

-- 4. Verificar se a coluna role existe e sincronizar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- 5. Atualizar a coluna role com o valor do perfil
UPDATE public.profiles 
SET role = perfil 
WHERE user_id = auth.uid() AND role IS NULL;

-- 6. Verificar o resultado final
SELECT 
  id,
  user_id,
  nome,
  email,
  perfil,
  role,
  ativo,
  created_at
FROM public.profiles 
WHERE user_id = auth.uid();

-- 7. Testar se as funções estão funcionando
SELECT 
  auth.uid() as current_user,
  public.is_admin() as is_admin,
  public.can_create_suggestions() as can_create_suggestions;

-- 8. Verificar se o usuário pode acessar a tabela profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 9. Verificar se o usuário pode ver outros perfis (como administrador)
SELECT 
  id,
  nome,
  email,
  perfil,
  ativo
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5; 