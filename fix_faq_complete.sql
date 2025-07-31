-- Script completo para resolver o problema do FAQ
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de FAQ se não existir
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tags TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Habilitar RLS
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Todos podem visualizar FAQ ativo" ON public.faq;
DROP POLICY IF EXISTS "Administradores podem gerenciar FAQ" ON public.faq;
DROP POLICY IF EXISTS "FAQ público para leitura" ON public.faq;

-- 5. Criar políticas para FAQ
CREATE POLICY "FAQ público para leitura" ON public.faq
  FOR SELECT USING (true);

CREATE POLICY "Administradores podem gerenciar FAQ" ON public.faq
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- 6. Criar trigger para atualizar updated_at no FAQ
DROP TRIGGER IF EXISTS update_faq_updated_at ON public.faq;
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Limpar dados existentes e inserir novos dados de exemplo
DELETE FROM public.faq;

-- 8. Inserir dados de exemplo para FAQ
INSERT INTO public.faq (pergunta, resposta, categoria, ordem) VALUES
('Como solicitar um serviço?', 'Acesse o catálogo de serviços e clique no serviço desejado. Preencha as informações necessárias e envie sua solicitação.', 'Geral', 1),
('Qual o prazo de resposta?', 'O prazo varia conforme o tipo de serviço. Consulte as informações específicas de cada serviço no catálogo.', 'Prazos', 2),
('Como acompanhar minha solicitação?', 'Acesse sua área pessoal para acompanhar o status de suas solicitações em tempo real.', 'Acompanhamento', 3),
('Posso cancelar uma solicitação?', 'Sim, você pode cancelar solicitações que ainda não foram iniciadas. Entre em contato com o suporte se necessário.', 'Geral', 4),
('Como reportar um problema?', 'Use a seção de sugestões para reportar problemas ou sugerir melhorias no sistema.', 'Suporte', 5),
('Quais são os horários de atendimento?', 'Nosso atendimento funciona de segunda a sexta, das 8h às 18h, exceto feriados.', 'Geral', 6),
('Como acessar o portal?', 'Use seu e-mail corporativo e senha para fazer login no portal. Em caso de problemas, entre em contato com o suporte.', 'Acesso', 7),
('Posso sugerir melhorias?', 'Sim! Use a seção "Sugerir" para propor melhorias ou novos serviços. Todas as sugestões são analisadas pela equipe.', 'Sugestões', 8);

-- 9. Verificar se os dados foram inseridos
SELECT COUNT(*) as total_faq FROM public.faq; 