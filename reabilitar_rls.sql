-- Script para reabilitar RLS com políticas simples
-- Execute este script APENAS quando a aplicação estiver funcionando

-- 1. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas SIMPLES e SEGURAS
-- Políticas para profiles
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores verem todos os perfis
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para outras tabelas (leitura pública)
CREATE POLICY "Todos podem visualizar áreas" ON public.areas
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar processos" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar subprocessos" ON public.subprocessos
  FOR SELECT USING (true);

CREATE POLICY "Todos podem visualizar serviços" ON public.servicos
  FOR SELECT USING (true);

-- Políticas para sugestões
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Usuários podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (criado_por = auth.uid());

-- 3. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Teste final
SELECT 
  'RLS reabilitado com sucesso' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'; 