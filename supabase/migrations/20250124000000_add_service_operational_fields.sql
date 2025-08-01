-- Adicionar campos operacionais na tabela servicos
ALTER TABLE public.servicos 
ADD COLUMN sistema_existente TEXT,
ADD COLUMN status_automatizacao TEXT CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual')),
ADD COLUMN data_ultima_validacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN status_validacao TEXT CHECK (status_validacao IN ('Validado', 'Pendente')) DEFAULT 'Pendente',
ADD COLUMN link_solicitacao TEXT;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.servicos.sistema_existente IS 'Nome do sistema existente (ex.: ERP Senior, Planilha, Zeev BPMS, Zeev Docs, Espresso, Alcis, Voll, Intranet)';
COMMENT ON COLUMN public.servicos.status_automatizacao IS 'Estado atual planejado (Automatizado, Planejado, Manual)';
COMMENT ON COLUMN public.servicos.data_ultima_validacao IS 'Data da validação da área - deve puxar automatico de quando passa a ser validado';
COMMENT ON COLUMN public.servicos.status_validacao IS 'Status de validação pela área (Validado, Pendente)';
COMMENT ON COLUMN public.servicos.link_solicitacao IS 'URL clicável do formulário, sistema ou intranet';

-- Trigger para atualizar automaticamente a data de validação quando o status muda para "Validado"
CREATE OR REPLACE FUNCTION update_data_ultima_validacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_validacao = 'Validado' AND (OLD.status_validacao IS NULL OR OLD.status_validacao != 'Validado') THEN
    NEW.data_ultima_validacao = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_data_ultima_validacao
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_data_ultima_validacao(); 