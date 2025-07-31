-- Script para corrigir a recursão infinita nas políticas RLS
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos remover as políticas problemáticas
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Superadministradores podem gerenciar perfis" ON public.profiles;

-- 2. Remover políticas problemáticas de outras tabelas
DROP POLICY IF EXISTS "Administradores podem gerenciar áreas" ON public.areas;
DROP POLICY IF EXISTS "Administradores podem gerenciar processos" ON public.processos;
DROP POLICY IF EXISTS "Administradores podem gerenciar subprocessos" ON public.subprocessos;
DROP POLICY IF EXISTS "Administradores podem gerenciar serviços" ON public.servicos;
DROP POLICY IF EXISTS "Administradores podem ver histórico" ON public.servicos_historico;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Colaboradores podem criar sugestões" ON public.sugestoes;

-- 3. Criar políticas corrigidas para profiles (sem recursão)
-- Política simples para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores (usando função auxiliar)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é administrador
  -- Usar uma consulta direta sem disparar políticas RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND perfil IN ('administrador', 'superadministrador')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para administradores gerenciarem todos os perfis
CREATE POLICY "Administradores podem gerenciar perfis" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 4. Criar políticas corrigidas para outras tabelas
-- Áreas
CREATE POLICY "Administradores podem gerenciar áreas" ON public.areas
  FOR ALL USING (public.is_admin());

-- Processos
CREATE POLICY "Administradores podem gerenciar processos" ON public.processos
  FOR ALL USING (public.is_admin());

-- Subprocessos
CREATE POLICY "Administradores podem gerenciar subprocessos" ON public.subprocessos
  FOR ALL USING (public.is_admin());

-- Serviços
CREATE POLICY "Administradores podem gerenciar serviços" ON public.servicos
  FOR ALL USING (public.is_admin());

-- Histórico
CREATE POLICY "Administradores podem ver histórico" ON public.servicos_historico
  FOR SELECT USING (public.is_admin());

-- Sugestões
CREATE POLICY "Administradores podem ver todas as sugestões" ON public.sugestoes
  FOR SELECT USING (public.is_admin());

-- Função para verificar se usuário pode criar sugestões
CREATE OR REPLACE FUNCTION public.can_create_suggestions()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND perfil IN ('colaborador', 'administrador', 'superadministrador')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Colaboradores podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (
    criado_por = auth.uid() AND public.can_create_suggestions()
  );

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Testar se a função is_admin está funcionando
SELECT 
  auth.uid() as current_user,
  public.is_admin() as is_admin,
  public.can_create_suggestions() as can_create_suggestions; 