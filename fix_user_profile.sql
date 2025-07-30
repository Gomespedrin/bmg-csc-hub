-- Script para verificar e corrigir o perfil do usuário
-- Baseado no erro no console: usuário 7484ad8f-67ff-40ca-b476-945d60aaf498

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '7484ad8f-67ff-40ca-b476-945d60aaf498';

-- 2. Verificar se já existe um perfil para este usuário
SELECT * FROM public.profiles 
WHERE user_id = '7484ad8f-67ff-40ca-b476-945d60aaf498';

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
) VALUES (
  gen_random_uuid(),
  '7484ad8f-67ff-40ca-b476-945d60aaf498',
  'Pedro Gomes',
  'gpedrogomes13@gmail.com',
  'administrador',
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificar se a coluna role existe e sincronizar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- 5. Atualizar a coluna role com o valor do perfil
UPDATE public.profiles 
SET role = perfil 
WHERE user_id = '7484ad8f-67ff-40ca-b476-945d60aaf498' AND role IS NULL;

-- 6. Verificar o resultado final
SELECT id, user_id, nome, email, perfil, role, ativo 
FROM public.profiles 
WHERE user_id = '7484ad8f-67ff-40ca-b476-945d60aaf498';

-- 7. Verificar se as políticas RLS estão funcionando
-- Testar se o usuário pode criar sugestões
SELECT 
  auth.uid() as current_user,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('colaborador', 'administrador', 'superadministrador')
  ) as can_create_suggestions; 