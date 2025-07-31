-- Teste final para verificar se tudo está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 3. Verificar perfis existentes
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

-- 4. Teste de consulta simples
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 5. Verificar se há políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'profiles'; 