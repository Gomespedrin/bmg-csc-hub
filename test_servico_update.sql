-- Teste de atualização de serviço com novos campos
-- Primeiro, vamos verificar se os campos existem
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'servicos' 
AND column_name IN ('sistema_existente', 'status_automatizacao', 'status_validacao', 'link_solicitacao')
ORDER BY column_name;

-- Verificar se há algum serviço para testar
SELECT id, produto, sistema_existente, status_automatizacao, status_validacao, link_solicitacao 
FROM servicos 
LIMIT 1;

-- Teste de atualização (substitua o ID por um ID real)
-- UPDATE servicos 
-- SET 
--   sistema_existente = 'ERP Senior',
--   status_automatizacao = 'Automatizado',
--   status_validacao = 'Validado',
--   link_solicitacao = 'https://exemplo.com/solicitar'
-- WHERE id = 'ID_DO_SERVICO';

-- Verificar as constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'servicos' 
AND kcu.column_name IN ('status_automatizacao', 'status_validacao'); 