-- Criar tabela de FAQ
CREATE TABLE public.faq (
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

-- Criar tabela de Auditoria
CREATE TABLE public.auditoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  detalhes TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de Configurações
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_portal TEXT NOT NULL DEFAULT 'Portal CSC - Centro de Serviços Compartilhados',
  email_contato TEXT NOT NULL DEFAULT 'csc@bmg.com',
  versao_sistema TEXT NOT NULL DEFAULT '1.0.0',
  notificacoes_email BOOLEAN NOT NULL DEFAULT true,
  notificacoes_push BOOLEAN NOT NULL DEFAULT true,
  notificacoes_sms BOOLEAN NOT NULL DEFAULT false,
  frequencia_backup TEXT NOT NULL DEFAULT 'diario',
  retencao_logs INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (id, nome_portal, email_contato, versao_sistema)
VALUES (
  gen_random_uuid(),
  'Portal CSC - Centro de Serviços Compartilhados',
  'csc@bmg.com',
  '1.0.0'
);

-- Habilitar RLS
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para FAQ (leitura pública, escrita apenas por administradores)
CREATE POLICY "Todos podem visualizar FAQ ativo" ON public.faq
  FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem gerenciar FAQ" ON public.faq
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para Auditoria (apenas administradores podem visualizar)
CREATE POLICY "Administradores podem visualizar auditoria" ON public.auditoria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para Configurações (apenas administradores podem gerenciar)
CREATE POLICY "Administradores podem gerenciar configurações" ON public.configuracoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Criar trigger para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.auditoria (
      usuario_id,
      acao,
      tabela,
      registro_id,
      dados_novos,
      detalhes
    ) VALUES (
      auth.uid(),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW),
      'Registro criado'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.auditoria (
      usuario_id,
      acao,
      tabela,
      registro_id,
      dados_anteriores,
      dados_novos,
      detalhes
    ) VALUES (
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Registro atualizado'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.auditoria (
      usuario_id,
      acao,
      tabela,
      registro_id,
      dados_anteriores,
      detalhes
    ) VALUES (
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      'Registro excluído'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para auditoria nas tabelas principais
CREATE TRIGGER audit_areas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.areas
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_processos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_subprocessos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subprocessos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_servicos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_sugestoes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sugestoes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_faq_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_configuracoes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns dados de exemplo para FAQ
INSERT INTO public.faq (pergunta, resposta, categoria, ordem) VALUES
('Como solicitar um serviço?', 'Acesse o catálogo de serviços e clique no serviço desejado. Preencha as informações necessárias e envie sua solicitação.', 'Geral', 1),
('Qual o prazo de resposta?', 'O prazo varia conforme o tipo de serviço. Consulte as informações específicas de cada serviço no catálogo.', 'Prazos', 2),
('Como acompanhar minha solicitação?', 'Acesse sua área pessoal para acompanhar o status de suas solicitações em tempo real.', 'Acompanhamento', 3),
('Posso cancelar uma solicitação?', 'Sim, você pode cancelar solicitações que ainda não foram iniciadas. Entre em contato com o suporte se necessário.', 'Geral', 4),
('Como reportar um problema?', 'Use a seção de sugestões para reportar problemas ou sugerir melhorias no sistema.', 'Suporte', 5); 