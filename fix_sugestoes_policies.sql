-- Script para corrigir políticas RLS da tabela sugestoes

-- 1. Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Colaboradores podem criar sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem atualizar sugestões" ON public.sugestoes;

-- 2. Recriar políticas mais simples e funcionais
-- Política para inserção (qualquer usuário autenticado pode criar)
CREATE POLICY "Usuários autenticados podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (criado_por = auth.uid());

-- Política para visualização (usuários veem suas próprias, admins veem todas)
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (
    criado_por = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Política para atualização (apenas admins)
CREATE POLICY "Administradores podem atualizar sugestões" ON public.sugestoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- 3. Verificar se as políticas foram criadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'sugestoes';

-- 4. Testar inserção (execute como usuário autenticado)
-- INSERT INTO public.sugestoes (
--   tipo,
--   dados_sugeridos,
--   justificativa,
--   criado_por,
--   status
-- ) VALUES (
--   'novo',
--   '{"teste": "dados"}'::jsonb,
--   'Teste após correção das políticas',
--   auth.uid(),
--   'pendente'
-- ); 