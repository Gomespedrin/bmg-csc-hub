-- Corrigir políticas do FAQ para permitir leitura pública
DROP POLICY IF EXISTS "Todos podem visualizar FAQ ativo" ON public.faq;

-- Política mais permissiva para leitura pública do FAQ
CREATE POLICY "FAQ público para leitura" ON public.faq
  FOR SELECT USING (true);

-- Manter política de administração
CREATE POLICY "Administradores podem gerenciar FAQ" ON public.faq
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  ); 