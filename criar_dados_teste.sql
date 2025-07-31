-- Script para criar dados de teste
-- Execute este script se a aplicação ainda não mostrar usuários

-- 1. Adicionar alguns usuários de teste
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
  (gen_random_uuid(), gen_random_uuid(), 'Carlos Oliveira', 'carlos@teste.com', 'colaborador', true, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'Ana Costa', 'ana@teste.com', 'colaborador', true, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'Roberto Lima', 'roberto@teste.com', 'administrador', true, now(), now())
ON CONFLICT (email) DO NOTHING;

-- 2. Verificar todos os usuários
SELECT 
  'Todos os usuários' as status,
  id,
  user_id,
  nome,
  email,
  perfil,
  ativo,
  created_at
FROM public.profiles 
ORDER BY nome;

-- 3. Verificar total
SELECT 
  'RESULTADO FINAL' as status,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN perfil = 'administrador' THEN 1 END) as administradores,
  COUNT(CASE WHEN perfil = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles; 