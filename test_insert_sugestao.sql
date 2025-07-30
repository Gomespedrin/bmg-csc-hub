-- Script para testar inserção de sugestão

-- 1. Verificar se o usuário existe e tem perfil correto
SELECT 
  p.user_id,
  p.nome,
  p.perfil,
  p.ativo,
  u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.user_id = '7404ad8f-67ff-40ca-b476-945d60aaf498';

-- 2. Verificar se a política de inserção está funcionando
-- (Execute isso como o usuário autenticado)
SELECT 
  auth.uid() as current_user,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND perfil IN ('colaborador', 'administrador', 'superadministrador')
  ) as can_create_suggestions;

-- 3. Tentar inserir uma sugestão de teste
-- (Execute isso como o usuário autenticado)
INSERT INTO public.sugestoes (
  tipo,
  dados_sugeridos,
  justificativa,
  criado_por,
  status
) VALUES (
  'novo',
  '{"modo": "criacao", "escopo": "area", "nome": "teste123", "descricao": "teste123"}'::jsonb,
  'Teste de inserção via SQL',
  '7404ad8f-67ff-40ca-b476-945d60aaf498',
  'pendente'
) RETURNING id, tipo, status, created_at;

-- 4. Verificar se a inserção funcionou
SELECT 
  id,
  tipo,
  status,
  criado_por,
  created_at,
  dados_sugeridos
FROM public.sugestoes 
WHERE criado_por = '7404ad8f-67ff-40ca-b476-945d60aaf498'
ORDER BY created_at DESC
LIMIT 5; 