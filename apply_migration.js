const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vprfxnvwxlsfxccbhskq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcmZ4bnZ3eGxzZnhjY2Joc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjgwNDgsImV4cCI6MjA2ODQ0NDA0OH0._0EHvzLfWmxSVKdsGu41-ydQu9Ej4TKX1nseHYaTosA'
);

async function applyMigration() {
  try {
    console.log('Aplicando migração...');
    
    // Adicionar colunas
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.servicos 
        ADD COLUMN IF NOT EXISTS sistema_existente TEXT,
        ADD COLUMN IF NOT EXISTS status_automatizacao TEXT CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual')),
        ADD COLUMN IF NOT EXISTS data_ultima_validacao TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('Validado', 'Pendente')) DEFAULT 'Pendente',
        ADD COLUMN IF NOT EXISTS link_solicitacao TEXT;
      `
    });

    if (alterError) {
      console.error('Erro ao adicionar colunas:', alterError);
      return;
    }

    console.log('Colunas adicionadas com sucesso!');
    
    // Adicionar comentários
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.servicos.sistema_existente IS 'Nome do sistema existente (ex.: ERP Senior, Planilha, Zeev BPMS, Zeev Docs, Espresso, Alcis, Voll, Intranet)';
        COMMENT ON COLUMN public.servicos.status_automatizacao IS 'Estado atual planejado (Automatizado, Planejado, Manual)';
        COMMENT ON COLUMN public.servicos.data_ultima_validacao IS 'Data da validação da área - deve puxar automatico de quando passa a ser validado';
        COMMENT ON COLUMN public.servicos.status_validacao IS 'Status de validação pela área (Validado, Pendente)';
        COMMENT ON COLUMN public.servicos.link_solicitacao IS 'URL clicável do formulário, sistema ou intranet';
      `
    });

    if (commentError) {
      console.error('Erro ao adicionar comentários:', commentError);
      return;
    }

    console.log('Comentários adicionados com sucesso!');
    
    // Criar função e trigger
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_data_ultima_validacao()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.status_validacao = 'Validado' AND (OLD.status_validacao IS NULL OR OLD.status_validacao != 'Validado') THEN
            NEW.data_ultima_validacao = NOW();
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_data_ultima_validacao ON public.servicos;
        CREATE TRIGGER trigger_update_data_ultima_validacao
          BEFORE UPDATE ON public.servicos
          FOR EACH ROW
          EXECUTE FUNCTION update_data_ultima_validacao();
      `
    });

    if (functionError) {
      console.error('Erro ao criar função e trigger:', functionError);
      return;
    }

    console.log('Função e trigger criados com sucesso!');
    console.log('Migração aplicada com sucesso!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

applyMigration(); 