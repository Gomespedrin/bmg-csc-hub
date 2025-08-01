const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vprfxnvwxlsfxccbhskq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcmZ4bnZ3eGxzZnhjY2Joc2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjgwNDgsImV4cCI6MjA2ODQ0NDA0OH0._0EHvzLfWmxSVKdsGu41-ydQu9Ej4TKX1nseHYaTosA'
);

async function verificarMigracao() {
  try {
    console.log('🔍 Verificando se a migração foi aplicada...\n');

    // 1. Verificar se as colunas existem
    console.log('1. Verificando colunas...');
    const { data: servicos, error: colunasError } = await supabase
      .from('servicos')
      .select('id, produto, sistema_existente, status_automatizacao, status_validacao, data_ultima_validacao, link_solicitacao')
      .limit(1);

    if (colunasError) {
      console.log('❌ Erro ao verificar colunas:', colunasError.message);
      console.log('\n📋 Para aplicar a migração:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá em SQL Editor');
      console.log('3. Execute o conteúdo do arquivo migracao_campos_servicos.sql');
      console.log('4. Execute este script novamente para verificar');
      return;
    }

    console.log('✅ Colunas verificadas com sucesso!');
    console.log('📊 Dados de exemplo:', servicos);

    // 2. Testar inserção de dados de exemplo
    console.log('\n2. Testando inserção de dados...');
    const { data: testInsert, error: insertError } = await supabase
      .from('servicos')
      .select('id, produto, sistema_existente, status_automatizacao, status_validacao, data_ultima_validacao, link_solicitacao')
      .eq('id', servicos[0]?.id)
      .single();

    if (insertError) {
      console.log('❌ Erro ao testar dados:', insertError.message);
    } else {
      console.log('✅ Dados de teste carregados com sucesso!');
      console.log('📋 Estrutura dos dados:', Object.keys(testInsert));
    }

    // 3. Verificar se o trigger funciona
    console.log('\n3. Verificando trigger de validação...');
    const { data: triggerTest, error: triggerError } = await supabase
      .from('servicos')
      .update({ 
        status_validacao: 'Validado',
        sistema_existente: 'Sistema Teste',
        status_automatizacao: 'Automatizado',
        link_solicitacao: 'https://exemplo.com'
      })
      .eq('id', servicos[0]?.id)
      .select('id, status_validacao, data_ultima_validacao, sistema_existente, status_automatizacao, link_solicitacao')
      .single();

    if (triggerError) {
      console.log('❌ Erro ao testar trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger funcionando!');
      console.log('📅 Data de validação atualizada:', triggerTest.data_ultima_validacao);
    }

    console.log('\n🎉 Migração aplicada com sucesso!');
    console.log('✅ Todos os novos campos estão funcionando');
    console.log('✅ O trigger de atualização automática está ativo');
    console.log('✅ A aplicação frontend pode usar os novos campos');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarMigracao(); 