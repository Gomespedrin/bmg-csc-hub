-- Teste para verificar se a aplicação consegue acessar os dados
-- Execute este script no Supabase SQL Editor

-- 1. Simular a consulta exata que a aplicação faz
SELECT 
  'Teste da aplicação' as status,
  COUNT(*) as total_usuarios
FROM public.profiles 
ORDER BY nome;

-- 2. Verificar se há dados para mostrar
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

-- 3. Verificar se RLS está realmente desabilitado
SELECT 
  'RLS Status' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 4. Verificar se há políticas ativas
SELECT 
  'Políticas ativas' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 5. Teste de inserção (se necessário)
-- Descomente se precisar criar mais dados de teste
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
) VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'João Silva', 'joao@teste.com', 'colaborador', true, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'Maria Santos', 'maria@teste.com', 'administrador', true, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'Carlos Oliveira', 'carlos@teste.com', 'colaborador', true, now(), now());
*/

-- 6. Verificar resultado final
SELECT 
  'RESULTADO FINAL' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN perfil = 'administrador' THEN 1 END) as administradores,
  COUNT(CASE WHEN perfil = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles; 