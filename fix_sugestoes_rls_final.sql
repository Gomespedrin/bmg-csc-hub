-- Script final para corrigir as políticas RLS da tabela sugestoes
-- Execute este script no Supabase Dashboard

-- 1. Verificar se RLS está habilitado
SELECT 'RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'sugestoes';

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários autenticados podem criar sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem atualizar sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Colaboradores podem criar sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;

-- 3. Recriar políticas mais simples e permissivas
-- Política para INSERT: qualquer usuário autenticado pode criar sugestões
CREATE POLICY "Usuários autenticados podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para SELECT: usuários veem suas próprias sugestões + admins veem todas
CREATE POLICY "Usuários podem ver sugestões" ON public.sugestoes
  FOR SELECT USING (
    criado_por = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Política para UPDATE: apenas admins podem atualizar
CREATE POLICY "Administradores podem atualizar sugestões" ON public.sugestoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- 4. Verificar se as políticas foram criadas
SELECT 'Políticas RLS criadas:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'sugestoes';

-- 5. Testar inserção (execute como usuário autenticado)
-- INSERT INTO public.sugestoes (
--   tipo,
--   dados_sugeridos,
--   justificativa,
--   criado_por,
--   status
-- ) VALUES (
--   'novo',
--   '{"teste": "dados"}'::jsonb,
--   'Teste após correção das políticas RLS',
--   auth.uid(),
--   'pendente'
-- );

-- 6. Verificar estrutura da tabela
SELECT 'Estrutura da tabela sugestoes:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sugestoes' 
AND table_schema = 'public'
ORDER BY ordinal_position; 