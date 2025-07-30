-- Enable RLS
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subprocessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for areas" ON public.areas
  FOR SELECT USING (true);

CREATE POLICY "Public read access for processos" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Public read access for subprocessos" ON public.subprocessos
  FOR SELECT USING (true);

CREATE POLICY "Public read access for servicos" ON public.servicos
  FOR SELECT USING (true);

-- Inserir mais dados de exemplo para ter mais serviços
-- Inserir mais processos para outras áreas
INSERT INTO public.processos (area_id, nome, descricao) 
SELECT a.id, p.nome, p.descricao
FROM public.areas a
CROSS JOIN (VALUES 
  ('Suporte Técnico', 'Suporte e manutenção de sistemas'),
  ('Desenvolvimento', 'Desenvolvimento de software'),
  ('Infraestrutura', 'Gestão de infraestrutura de TI')
) AS p(nome, descricao)
WHERE a.nome = 'Tecnologia da Informação';

INSERT INTO public.processos (area_id, nome, descricao) 
SELECT a.id, p.nome, p.descricao
FROM public.areas a
CROSS JOIN (VALUES 
  ('Contabilidade', 'Gestão contábil e relatórios'),
  ('Tesouraria', 'Gestão de caixa e investimentos'),
  ('Controladoria', 'Controle interno e auditoria')
) AS p(nome, descricao)
WHERE a.nome = 'Financeiro';

INSERT INTO public.processos (area_id, nome, descricao) 
SELECT a.id, p.nome, p.descricao
FROM public.areas a
CROSS JOIN (VALUES 
  ('Contratos', 'Elaboração e revisão de contratos'),
  ('Compliance', 'Conformidade legal e regulatória'),
  ('Litígios', 'Gestão de processos judiciais')
) AS p(nome, descricao)
WHERE a.nome = 'Jurídico';

-- Inserir subprocessos para os novos processos
INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, s.nome, s.descricao
FROM public.processos p
CROSS JOIN (VALUES
  ('Abertura de Ticket', 'Criação de tickets de suporte'),
  ('Análise de Problema', 'Diagnóstico de problemas técnicos'),
  ('Resolução', 'Solução e fechamento de tickets'),
  ('Preventiva', 'Manutenção preventiva de sistemas')
) AS s(nome, descricao)
WHERE p.nome = 'Suporte Técnico';

INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, s.nome, s.descricao
FROM public.processos p
CROSS JOIN (VALUES
  ('Análise de Requisitos', 'Coleta e análise de requisitos'),
  ('Desenvolvimento', 'Codificação e implementação'),
  ('Testes', 'Testes de qualidade'),
  ('Deploy', 'Implantação em produção')
) AS s(nome, descricao)
WHERE p.nome = 'Desenvolvimento';

INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, s.nome, s.descricao
FROM public.processos p
CROSS JOIN (VALUES
  ('Gestão de Servidores', 'Administração de servidores'),
  ('Backup', 'Backup e recuperação de dados'),
  ('Monitoramento', 'Monitoramento de sistemas'),
  ('Segurança', 'Gestão de segurança da informação')
) AS s(nome, descricao)
WHERE p.nome = 'Infraestrutura';

-- Inserir serviços para os novos subprocessos
INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Abertura de Ticket de Suporte',
  'Serviço para abertura de tickets de suporte técnico',
  'Usuários internos',
  30, -- 30 minutos
  'Minutos',
  4, -- 4 horas
  98.0, -- 98%
  2024,
  'Demanda',
  'Descrição detalhada do problema'
FROM public.subprocessos s
WHERE s.nome = 'Abertura de Ticket';

INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Análise de Requisitos de Sistema',
  'Serviço para análise e documentação de requisitos',
  'Gestores de projeto',
  480, -- 8 horas
  'Horas',
  48, -- 48 horas
  95.0, -- 95%
  2024,
  'Demanda',
  'Reunião com stakeholders e documentação inicial'
FROM public.subprocessos s
WHERE s.nome = 'Análise de Requisitos';

INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Backup de Dados',
  'Serviço de backup automático de dados críticos',
  'Administradores de sistema',
  120, -- 2 horas
  'Horas',
  24, -- 24 horas
  99.9, -- 99.9%
  2024,
  'Rotina',
  'Configuração de agendamento e verificação de integridade'
FROM public.subprocessos s
WHERE s.nome = 'Backup';

-- Inserir mais serviços para outras áreas
INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Elaboração de Contrato',
  'Serviço para elaboração de contratos comerciais',
  'Área comercial e jurídica',
  960, -- 16 horas
  'Horas',
  72, -- 72 horas
  90.0, -- 90%
  2024,
  'Demanda',
  'Termos de negociação e documentação legal'
FROM public.subprocessos s
WHERE s.nome = 'Contratos';

INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Relatório Contábil Mensal',
  'Geração de relatórios contábeis mensais',
  'Gestores financeiros',
  240, -- 4 horas
  'Horas',
  48, -- 48 horas
  100.0, -- 100%
  2024,
  'Rotina',
  'Dados contábeis fechados do mês'
FROM public.processos p
JOIN public.subprocessos s ON s.processo_id = p.id
WHERE p.nome = 'Contabilidade' AND s.nome = 'Relatórios';

-- Inserir mais subprocessos para contabilidade
INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, 'Relatórios', 'Geração de relatórios contábeis'
FROM public.processos p
WHERE p.nome = 'Contabilidade';

-- Inserir mais serviços para RH
INSERT INTO public.servicos (subprocesso_id, produto, o_que_e, quem_pode_utilizar, tempo_medio, unidade_medida, sla, sli, ano, demanda_rotina, requisitos_operacionais)
SELECT s.id, 
  'Processamento de Folha de Pagamento',
  'Cálculo e processamento da folha de pagamento mensal',
  'RH e financeiro',
  480, -- 8 horas
  'Horas',
  72, -- 72 horas
  100.0, -- 100%
  2024,
  'Rotina',
  'Dados de funcionários e benefícios atualizados'
FROM public.subprocessos s
WHERE s.nome = 'Folha de Pagamento';

-- Inserir subprocesso para Folha de Pagamento
INSERT INTO public.subprocessos (processo_id, nome, descricao)
SELECT p.id, 'Folha de Pagamento', 'Processamento da folha de pagamento'
FROM public.processos p
WHERE p.nome = 'Folha de Pagamento';