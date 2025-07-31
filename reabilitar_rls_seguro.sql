-- Script para reabilitar RLS de forma segura
-- Execute este script APENAS quando a aplicação estiver funcionando

-- 1. Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

-- 2. Criar funções auxiliares SEGURAS (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário atual é administrador
  -- Usar SECURITY DEFINER para evitar recursão
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

-- 3. Criar políticas SEGURAS para profiles
-- Política para usuários verem seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores verem todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- 4. Criar políticas para outras tabelas
-- Áreas (leitura pública, escrita apenas para admins)
CREATE POLICY "Todos podem visualizar áreas" ON public.areas
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar áreas" ON public.areas
  FOR ALL USING (public.is_admin());

-- Processos (leitura pública, escrita apenas para admins)
CREATE POLICY "Todos podem visualizar processos" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar processos" ON public.processos
  FOR ALL USING (public.is_admin());

-- Subprocessos (leitura pública, escrita apenas para admins)
CREATE POLICY "Todos podem visualizar subprocessos" ON public.subprocessos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar subprocessos" ON public.subprocessos
  FOR ALL USING (public.is_admin());

-- Serviços (leitura pública, escrita apenas para admins)
CREATE POLICY "Todos podem visualizar serviços" ON public.servicos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar serviços" ON public.servicos
  FOR ALL USING (public.is_admin());

-- Sugestões (usuários veem suas próprias, admins veem todas)
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Administradores podem ver todas as sugestões" ON public.sugestoes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Usuários podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (
    criado_por = auth.uid() AND public.can_create_suggestions()
  );

-- 5. Verificar se as políticas foram criadas
SELECT 
  'Políticas criadas' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Teste final
SELECT 
  'RLS reabilitado com sucesso' as status,
  COUNT(*) as total_policies,
  'A aplicação deve continuar funcionando normalmente' as observacao
FROM pg_policies 
WHERE schemaname = 'public'; 