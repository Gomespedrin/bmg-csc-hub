# Guia do Administrador - Portal CSC

Este guia é destinado aos administradores do Portal CSC do Grupo BMG, explicando como utilizar as funcionalidades administrativas do sistema.

## Acesso ao Sistema

### Login como Administrador
1. Acesse o portal e clique em "Entrar"
2. Use suas credenciais de administrador
3. Após o login, você verá opções administrativas no menu do usuário

### Verificação de Permissões
- **Administrador**: Pode gerenciar catálogo e sugestões
- **Super Administrador**: Pode gerenciar usuários e perfis
- **Colaborador**: Apenas visualização e sugestões

## Módulos Administrativos

### 1. Administração do Catálogo (`/admin/catalogo`)

#### Menu Lateral
- **Áreas**: Gestão das áreas organizacionais
- **Processos**: Gestão dos processos dentro de cada área
- **Subprocessos**: Gestão dos subprocessos dentro de cada processo
- **Serviços**: Gestão dos serviços finais do catálogo

#### Funcionalidades por Módulo

##### Áreas
- **Criar**: Adicionar novas áreas organizacionais
- **Editar**: Modificar informações de áreas existentes
- **Excluir**: Remover áreas (cuidado: afeta processos e serviços)
- **Campos**: Nome, Ícone, Descrição

##### Processos
- **Criar**: Adicionar processos dentro de áreas
- **Editar**: Modificar processos existentes
- **Excluir**: Remover processos (afeta subprocessos e serviços)
- **Campos**: Nome, Descrição, Área (obrigatório)

##### Subprocessos
- **Criar**: Adicionar subprocessos dentro de processos
- **Editar**: Modificar subprocessos existentes
- **Excluir**: Remover subprocessos (afeta serviços)
- **Campos**: Nome, Descrição, Processo (obrigatório)

##### Serviços
- **Criar**: Adicionar novos serviços ao catálogo
- **Editar**: Modificar serviços existentes
- **Excluir**: Remover serviços do catálogo
- **Campos**:
  - **Básicos**: Produto/Serviço, Subprocesso, O que é, Quem pode utilizar
  - **Avançados**: Tempo médio, SLA, SLI, Tipo de demanda, Requisitos, Observações

#### Interface de Gestão

##### Listagem
- **Busca**: Pesquisar por nome ou descrição
- **Filtros**: Por status (ativo/inativo)
- **Ações**: Editar e excluir para cada item
- **Hierarquia**: Visualização da estrutura completa

##### Formulários
- **Validação**: Campos obrigatórios marcados com *
- **Dependências**: Seleção em cascata (Área → Processo → Subprocesso)
- **Tabs**: Informações básicas e avançadas para serviços

### 2. Administração de Sugestões (`/admin/sugestoes`)

#### Visualização de Sugestões
- **Lista Completa**: Todas as sugestões enviadas pelos usuários
- **Status**: Pendente, Aprovada, Rejeitada
- **Filtros**: Por status e busca por texto
- **Detalhes**: Informações completas de cada sugestão

#### Processo de Aprovação

##### 1. Revisão
- Leia a sugestão completa
- Verifique os dados propostos
- Analise a justificativa do usuário

##### 2. Decisão
- **Aprovar**: Se a sugestão é válida e útil
- **Rejeitar**: Se a sugestão não é adequada
- **Comentário**: Sempre adicione um comentário explicativo

##### 3. Processamento Automático
- **Sugestões Aprovadas**: São automaticamente inseridas no catálogo
- **Novos Serviços**: Criam um novo registro no banco
- **Melhorias**: Atualizam o serviço existente

#### Tipos de Sugestão

##### Novo Serviço
- Usuário sugere um serviço completamente novo
- Requer criação de novo registro no catálogo
- Verificar se já existe serviço similar

##### Melhoria de Serviço
- Usuário sugere melhorias em serviço existente
- Atualiza o registro existente
- Preserva histórico de versões

## Boas Práticas

### Gestão do Catálogo

#### 1. Hierarquia
- **Mantenha a consistência**: Área → Processo → Subprocesso → Serviço
- **Evite duplicações**: Verifique se já existe antes de criar
- **Nomes claros**: Use nomes descritivos e consistentes

#### 2. Dados dos Serviços
- **Complete todos os campos**: Especialmente os obrigatórios
- **Informações precisas**: SLA, SLI e tempos médios realistas
- **Descrições claras**: Facilite o entendimento dos usuários

#### 3. Status e Ativação
- **Ative apenas serviços válidos**: Não ative serviços em desenvolvimento
- **Mantenha histórico**: Use soft delete quando possível
- **Comunique mudanças**: Informe usuários sobre alterações importantes

### Gestão de Sugestões

#### 1. Revisão Eficiente
- **Leia completamente**: Não decida apenas pelo título
- **Considere o contexto**: Entenda a necessidade do usuário
- **Verifique duplicações**: Busque por sugestões similares

#### 2. Feedback Construtivo
- **Comentários úteis**: Explique o motivo da decisão
- **Oriente o usuário**: Sugira melhorias quando rejeitar
- **Reconheça boas ideias**: Mesmo que não sejam implementadas

#### 3. Processamento
- **Aprove rapidamente**: Não deixe sugestões pendentes por muito tempo
- **Verifique dados**: Confirme se os dados estão corretos antes de aprovar
- **Teste funcionalidades**: Se possível, teste antes de aprovar

## Troubleshooting

### Problemas Comuns

#### 1. Erro ao Criar/Editar
- **Verifique permissões**: Confirme se você é administrador
- **Valide dados**: Todos os campos obrigatórios devem estar preenchidos
- **Verifique conexão**: Confirme se está conectado ao banco

#### 2. Sugestões Não Processadas
- **Verifique dados**: Os dados da sugestão devem estar completos
- **Confirme hierarquia**: Subprocesso deve existir para novos serviços
- **Verifique logs**: Consulte logs de erro no console

#### 3. Interface Não Carrega
- **Verifique login**: Confirme se está logado como administrador
- **Limpe cache**: Recarregue a página ou limpe cache do navegador
- **Verifique permissões**: Confirme se seu perfil tem acesso administrativo

### Contatos de Suporte

Para problemas técnicos ou dúvidas sobre o sistema:

- **Equipe de Desenvolvimento**: [email]
- **Suporte Técnico**: [telefone]
- **Documentação**: Consulte este guia e o README.md

## Atualizações do Sistema

### Novas Funcionalidades
- O sistema é atualizado regularmente
- Novas funcionalidades são comunicadas por email
- Consulte este guia para atualizações

### Backup e Segurança
- **Backup automático**: Dados são salvos automaticamente
- **Histórico de versões**: Alterações são registradas
- **Segurança**: Acesso restrito a administradores autorizados

---

**Última atualização**: [Data]
**Versão do sistema**: [Versão] 