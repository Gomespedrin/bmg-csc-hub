-- RLS SEM RECURSÃO - Solução definitiva
-- Execute este script para implementar RLS de forma segura

-- 1. Primeiro, desabilitar RLS para limpar tudo
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas e funções existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Todos podem visualizar áreas" ON public.areas;
DROP POLICY IF EXISTS "Administradores podem gerenciar áreas" ON public.areas;
DROP POLICY IF EXISTS "Todos podem visualizar processos" ON public.processos;
DROP POLICY IF EXISTS "Administradores podem gerenciar processos" ON public.processos;
DROP POLICY IF EXISTS "Todos podem visualizar subprocessos" ON public.subprocessos;
DROP POLICY IF EXISTS "Administradores podem gerenciar subprocessos" ON public.subprocessos;
DROP POLICY IF EXISTS "Todos podem visualizar serviços" ON public.servicos;
DROP POLICY IF EXISTS "Administradores podem gerenciar serviços" ON public.servicos;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Administradores podem ver todas as sugestões" ON public.sugestoes;
DROP POLICY IF EXISTS "Usuários podem criar sugestões" ON public.sugestoes;

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_create_suggestions();

-- 3. Criar uma tabela de configuração para armazenar permissões
CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id UUID PRIMARY KEY,
  is_admin BOOLEAN DEFAULT FALSE,
  can_create_suggestions BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar função para atualizar permissões automaticamente
CREATE OR REPLACE FUNCTION public.update_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar permissões baseadas no perfil
  INSERT INTO public.user_permissions (user_id, is_admin, can_create_suggestions)
  VALUES (
    NEW.user_id,
    NEW.perfil IN ('administrador', 'superadministrador'),
    NEW.perfil IN ('colaborador', 'administrador', 'superadministrador')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_admin = EXCLUDED.is_admin,
    can_create_suggestions = EXCLUDED.can_create_suggestions,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar permissões automaticamente
DROP TRIGGER IF EXISTS trigger_update_user_permissions ON public.profiles;
CREATE TRIGGER trigger_update_user_permissions
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_permissions();

-- 6. Atualizar permissões existentes
INSERT INTO public.user_permissions (user_id, is_admin, can_create_suggestions)
SELECT 
  user_id,
  perfil IN ('administrador', 'superadministrador'),
  perfil IN ('colaborador', 'administrador', 'superadministrador')
FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET
  is_admin = EXCLUDED.is_admin,
  can_create_suggestions = EXCLUDED.can_create_suggestions,
  updated_at = now();

-- 7. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas SEM RECURSÃO
-- Profiles: usuários veem seus próprios dados, admins veem todos
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Áreas: leitura pública, escrita apenas para admins
CREATE POLICY "Todos podem visualizar áreas" ON public.areas
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar áreas" ON public.areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Processos: leitura pública, escrita apenas para admins
CREATE POLICY "Todos podem visualizar processos" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar processos" ON public.processos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Subprocessos: leitura pública, escrita apenas para admins
CREATE POLICY "Todos podem visualizar subprocessos" ON public.subprocessos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar subprocessos" ON public.subprocessos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Serviços: leitura pública, escrita apenas para admins
CREATE POLICY "Todos podem visualizar serviços" ON public.servicos
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar serviços" ON public.servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Sugestões: usuários veem suas próprias, admins veem todas
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Administradores podem ver todas as sugestões" ON public.sugestoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Usuários podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (
    criado_por = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() AND can_create_suggestions = true
    )
  );

-- 9. Verificar se tudo foi criado
SELECT 
  'RLS implementado com sucesso' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- 10. Teste final
SELECT 
  'Teste de permissões' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_admin = true THEN 1 END) as admins
FROM public.user_permissions; 