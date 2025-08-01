const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vprfxnvwxlsfxccbhskq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcmZ4bnZ3eGxzZnhjY2Joc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjgwNDgsImV4cCI6MjA2ODQ0NDA0OH0._0EHvzLfWmxSVKdsGu41-ydQu9Ej4TKX1nseHYaTosA'
);

async function applyMigration() {
  try {
    console.log('Aplicando migração...');
    
    // Primeiro, vamos verificar se as colunas já existem
    const { data: existingColumns, error: checkError } = await supabase
      .from('servicos')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar tabela:', checkError);
      return;
    }

    console.log('Tabela servicos acessível. Aplicando migração...');

    // Como não podemos executar SQL diretamente, vamos criar um serviço de teste
    // para verificar se os novos campos funcionam
    const { data: testData, error: testError } = await supabase
      .from('servicos')
      .select('id, produto, sistema_existente, status_automatizacao, status_validacao, link_solicitacao')
      .limit(1);

    if (testError) {
      console.error('Erro ao testar novos campos:', testError);
      console.log('Os novos campos ainda não foram adicionados. Execute o SQL manualmente no Supabase Dashboard.');
      console.log('SQL necessário:');
      console.log(`
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS sistema_existente TEXT,
ADD COLUMN IF NOT EXISTS status_automatizacao TEXT CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual')),
ADD COLUMN IF NOT EXISTS data_ultima_validacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('Validado', 'Pendente')) DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS link_solicitacao TEXT;
      `);
      return;
    }

    console.log('✅ Novos campos já estão disponíveis!');
    console.log('Dados de teste:', testData);
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

applyMigration(); 