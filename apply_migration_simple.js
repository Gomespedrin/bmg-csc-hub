const SUPABASE_URL = 'https://vprfxnvwxlsfxccbhskq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcmZ4bnZ3eGxzZnhjY2Joc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjgwNDgsImV4cCI6MjA2ODQ0NDA0OH0._0EHvzLfWmxSVKdsGu41-ydQu9Ej4TKX1nseHYaTosA';

async function applyMigration() {
  try {
    console.log('Aplicando migração...');
    
    // SQL para adicionar as colunas
    const sql = `
      ALTER TABLE public.servicos 
      ADD COLUMN IF NOT EXISTS sistema_existente TEXT,
      ADD COLUMN IF NOT EXISTS status_automatizacao TEXT CHECK (status_automatizacao IN ('Automatizado', 'Planejado', 'Manual')),
      ADD COLUMN IF NOT EXISTS data_ultima_validacao TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('Validado', 'Pendente')) DEFAULT 'Pendente',
      ADD COLUMN IF NOT EXISTS link_solicitacao TEXT;
    `;

    // Executar via REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro na resposta:', response.status, error);
      return;
    }

    const result = await response.json();
    console.log('Resultado:', result);
    
    console.log('Migração aplicada com sucesso!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

applyMigration(); 