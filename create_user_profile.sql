-- Script para criar o perfil do usuário que está causando erro
-- Baseado no erro no console: usuário 7404ad8f-67ff-40ca-b476-945d60aaf498 não tem perfil

-- Verificar se o usuário existe na tabela auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '7404ad8f-67ff-40ca-b476-945d60aaf498';

-- Inserir o perfil do usuário
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
  '7404ad8f-67ff-40ca-b476-945d60aaf498',
  'Pedro Gomes',
  'gpedrogomes13@gmail.com',
  'administrador',
  true,
  now(),
  now()
);

-- Verificar se o perfil foi criado
SELECT * FROM public.profiles WHERE user_id = '7404ad8f-67ff-40ca-b476-945d60aaf498';

-- Se você quiser adicionar também a coluna role (conforme mencionado anteriormente)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- Atualizar a coluna role com o valor do perfil
UPDATE public.profiles 
SET role = perfil 
WHERE user_id = '7404ad8f-67ff-40ca-b476-945d60aaf498' AND role IS NULL;

-- Verificar o resultado final
SELECT id, user_id, nome, email, perfil, role, ativo 
FROM public.profiles 
WHERE user_id = '7404ad8f-67ff-40ca-b476-945d60aaf498'; 