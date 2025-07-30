-- Script para diagnosticar problemas com a tabela sugestoes

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'sugestoes';

-- 3. Verificar as políticas RLS existentes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'sugestoes';

-- 4. Verificar se o usuário tem perfil correto
SELECT 
  user_id,
  nome,
  perfil,
  ativo
FROM public.profiles 
WHERE user_id = '7404ad8f-67ff-40ca-b476-945d60aaf498';

-- 5. Testar se o usuário pode inserir (simulação)
SELECT 
  auth.uid() as current_user,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('colaborador', 'administrador', 'superadministrador')
  ) as can_create_suggestions,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
  ) as is_admin;

-- 6. Verificar se há dados na tabela
SELECT COUNT(*) as total_sugestoes FROM public.sugestoes;

-- 7. Tentar inserir um registro de teste (comentado para segurança)
/*
INSERT INTO public.sugestoes (
  tipo,
  dados_sugeridos,
  justificativa,
  criado_por,
  status
) VALUES (
  'novo',
  '{"teste": "dados"}'::jsonb,
  'Teste de inserção',
  '7404ad8f-67ff-40ca-b476-945d60aaf498',
  'pendente'
);
*/ 