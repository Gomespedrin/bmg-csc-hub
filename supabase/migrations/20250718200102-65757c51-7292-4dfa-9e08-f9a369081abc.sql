-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'colaborador' CHECK (perfil IN ('visitante', 'colaborador', 'administrador', 'superadministrador')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de áreas
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  icone TEXT,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de processos
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(area_id, nome)
);

-- Criar tabela de subprocessos
CREATE TABLE public.subprocessos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(processo_id, nome)
);

-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subprocesso_id UUID NOT NULL REFERENCES public.subprocessos(id) ON DELETE CASCADE,
  produto TEXT NOT NULL,
  o_que_e TEXT,
  quem_pode_utilizar TEXT,
  tempo_medio INTEGER, -- em minutos
  unidade_medida TEXT,
  sla INTEGER, -- em horas
  sli DECIMAL(5,2), -- percentual
  ano INTEGER,
  requisitos_operacionais TEXT,
  observacoes TEXT,
  demanda_rotina TEXT CHECK (demanda_rotina IN ('Demanda', 'Rotina')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  versao INTEGER NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subprocesso_id, produto, versao)
);

-- Criar tabela de histórico de versões
CREATE TABLE public.servicos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  alteracoes JSONB NOT NULL,
  alterado_por UUID,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de sugestões
CREATE TABLE public.sugestoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('novo', 'edicao')),
  servico_id UUID REFERENCES public.servicos(id), -- null para novos serviços
  dados_sugeridos JSONB NOT NULL,
  justificativa TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  comentario_admin TEXT,
  criado_por UUID NOT NULL,
  aprovado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de anexos
CREATE TABLE public.anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE CASCADE,
  sugestao_id UUID REFERENCES public.sugestoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tamanho INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((servico_id IS NOT NULL AND sugestao_id IS NULL) OR (servico_id IS NULL AND sugestao_id IS NOT NULL))
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadministradores podem gerenciar perfis" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil = 'superadministrador'
    )
  );

-- Políticas para áreas, processos, subprocessos (leitura pública)
CREATE POLICY "Todos podem visualizar áreas" ON public.areas
  FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem gerenciar áreas" ON public.areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

CREATE POLICY "Todos podem visualizar processos" ON public.processos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem gerenciar processos" ON public.processos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

CREATE POLICY "Todos podem visualizar subprocessos" ON public.subprocessos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Administradores podem gerenciar subprocessos" ON public.subprocessos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para serviços
CREATE POLICY "Todos podem visualizar serviços ativos" ON public.servicos
  FOR SELECT USING (ativo = true AND status = 'ativo');

CREATE POLICY "Administradores podem gerenciar serviços" ON public.servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para histórico
CREATE POLICY "Administradores podem ver histórico" ON public.servicos_historico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para sugestões
CREATE POLICY "Usuários podem ver suas próprias sugestões" ON public.sugestoes
  FOR SELECT USING (criado_por = auth.uid());

CREATE POLICY "Administradores podem ver todas as sugestões" ON public.sugestoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

CREATE POLICY "Colaboradores podem criar sugestões" ON public.sugestoes
  FOR INSERT WITH CHECK (
    criado_por = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('colaborador', 'administrador', 'superadministrador')
    )
  );

CREATE POLICY "Administradores podem atualizar sugestões" ON public.sugestoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Políticas para anexos
CREATE POLICY "Todos podem ver anexos de serviços ativos" ON public.anexos
  FOR SELECT USING (
    servico_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.servicos WHERE id = anexos.servico_id AND ativo = true)
  );

CREATE POLICY "Administradores podem gerenciar anexos" ON public.anexos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil IN ('administrador', 'superadministrador')
    )
  );

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON public.areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subprocessos_updated_at
  BEFORE UPDATE ON public.subprocessos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sugestoes_updated_at
  BEFORE UPDATE ON public.sugestoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.areas (nome, icone, descricao) VALUES
('Recursos Humanos', '👥', 'Gestão de pessoas e desenvolvimento organizacional'),
('Tecnologia da Informação', '💻', 'Infraestrutura, desenvolvimento e suporte técnico'),
('Financeiro', '💰', 'Gestão financeira e contábil'),
('Jurídico', '⚖️', 'Assessoria jurídica e compliance'),
('Comercial', '📈', 'Vendas, marketing e relacionamento com clientes'),
('Operações', '⚙️', 'Processos operacionais e logística');

-- Inserir processos para RH
INSERT INTO public.processos (area_id, nome, descricao) 
SELECT a.id, p.nome, p.descricao
FROM public.areas a
CROSS JOIN (VALUES 
  ('Recrutamento e Seleção', 'Processos de contratação de pessoal'),
  ('Desenvolvimento', 'Treinamento e capacitação'),
  ('Folha de Pagamento', 'Gestão da remuneração')
) AS p(nome, descricao)
WHERE a.nome = 'Recursos Humanos';

-- Inserir subprocessos para Recrutamento e Seleção
INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, s.nome, s.descricao
FROM public.processos p
CROSS JOIN (VALUES
  ('Abertura de Vaga', 'Criação e aprovação de novas vagas'),
  ('Triagem de Currículos', 'Análise inicial de candidatos'),
  ('Entrevistas', 'Processo de entrevistas'),
  ('Contratação', 'Formalização da contratação')
) AS s(nome, descricao)
WHERE p.nome = 'Recrutamento e Seleção';

-- Inserir alguns serviços de exemplo
INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Publicação de Vaga Interna',
  'Serviço para divulgação de oportunidades internas na empresa',
  'Gestores e líderes de equipe',
  120, -- 2 horas
  'Horas',
  24, -- 24 horas
  95.0, -- 95%
  2024,
  'Demanda',
  'Aprovação do gestor direto e descrição detalhada da vaga'
FROM public.subprocessos s
WHERE s.nome = 'Abertura de Vaga';