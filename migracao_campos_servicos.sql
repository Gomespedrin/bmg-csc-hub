-- =====================================================
-- MIGRAÇÃO: Adicionar campos operacionais na tabela servicos
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Adicionar as novas colunas
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS sistema_existente TEXT,
ADD COLUMN IF NOT EXISTS status_automatizacao TEXT CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual')),
ADD COLUMN IF NOT EXISTS data_ultima_validacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('Validado', 'Pendente')) DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS link_solicitacao TEXT;

-- 2. Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.servicos.sistema_existente IS 'Nome do sistema existente (ex.: ERP Senior, Planilha, Zeev BPMS, Zeev Docs, Espresso, Alcis, Voll, Intranet)';
COMMENT ON COLUMN public.servicos.status_automatizacao IS 'Estado atual planejado (Automatizado, Planejado, Manual)';
COMMENT ON COLUMN public.servicos.data_ultima_validacao IS 'Data da validação da área - deve puxar automatico de quando passa a ser validado';
COMMENT ON COLUMN public.servicos.status_validacao IS 'Status de validação pela área (Validado, Pendente)';
COMMENT ON COLUMN public.servicos.link_solicitacao IS 'URL clicável do formulário, sistema ou intranet';

-- 3. Criar função para atualizar automaticamente a data de validação
CREATE OR REPLACE FUNCTION update_data_ultima_validacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_validacao = 'Validado' AND (OLD.status_validacao IS NULL OR OLD.status_validacao != 'Validado') THEN
    NEW.data_ultima_validacao = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para executar a função automaticamente
DROP TRIGGER IF EXISTS trigger_update_data_ultima_validacao ON public.servicos;
CREATE TRIGGER trigger_update_data_ultima_validacao
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_data_ultima_validacao();

-- 5. Verificar se as colunas foram criadas corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'servicos' 
  AND column_name IN ('sistema_existente', 'status_automatizacao', 'data_ultima_validacao', 'status_validacao', 'link_solicitacao')
ORDER BY column_name;

-- 6. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'servicos' 
  AND trigger_name = 'trigger_update_data_ultima_validacao'; 