# BMG CSC Hub

Portal do Centro de Serviços Compartilhados do Grupo BMG - Centralize, consulte e gerencie todos os serviços organizacional.

## 🚀 Funcionalidades

- **Catálogo de Serviços**: Explore todos os serviços disponíveis organizados por área, processo e subprocesso
- **Navegação Intuitiva**: URLs amigáveis baseadas em nomes ao invés de UUIDs
- **Busca Avançada**: Filtros por área, processo, subprocesso e status
- **Sugestões**: Sistema para sugerir novos serviços ou melhorias
- **Interface Moderna**: Design responsivo e acessível

## 🔗 URLs Amigáveis

O sistema agora usa URLs amigáveis baseadas nos nomes das entidades, tornando a navegação muito mais intuitiva:

### Exemplos de URLs:

**Antes (com UUIDs):**
```
/areas/123e4567-e89b-12d3-a456-426614174000
/servicos/987fcdeb-51a2-43d1-9f12-345678901234
```

**Agora (com slugs):**
```
/areas/recursos-humanos-123e4567-e89b-12d3-a456-426614174000
/servicos/abertura-de-conta-pj-987fcdeb-51a2-43d1-9f12-345678901234
```

### Estrutura das URLs:

- **Áreas**: `/areas/{nome-da-area}-{id}`
  - Ex: `/areas/recursos-humanos-123e4567-e89b-12d3-a456-426614174000`
  - Ex: `/areas/tecnologia-da-informacao-456e7890-f12c-34d5-b678-901234567890`

- **Serviços**: `/servicos/{nome-do-servico}-{id}`
  - Ex: `/servicos/abertura-de-conta-pj-987fcdeb-51a2-43d1-9f12-345678901234`
  - Ex: `/servicos/processamento-de-folha-abc123def-456g-789h-012i-345678901234`

### Benefícios:

1. **Intuitividade**: As URLs mostram claramente o que contêm
2. **SEO**: Melhor para motores de busca
3. **Compartilhamento**: URLs mais fáceis de compartilhar
4. **Navegação**: Usuários podem entender a estrutura da URL
5. **Manutenção**: Mais fácil de debugar e manter

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Estado**: TanStack Query (React Query)
- **Roteamento**: React Router DOM

## 📦 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

## 🗄️ Estrutura do Banco

O sistema segue uma hierarquia clara:

```
Área → Processo → Subprocesso → Serviço
```

### Tabelas Principais:

- **areas**: Áreas organizacionais
- **processos**: Processos dentro de cada área
- **subprocessos**: Subprocessos dentro de cada processo
- **servicos**: Serviços específicos oferecidos
- **sugestoes**: Sugestões de novos serviços ou melhorias

## 🎯 Funcionalidades Principais

### 1. Navegação por Área
- Visualize todas as áreas disponíveis
- Acesse detalhes específicos de cada área
- Veja processos e serviços relacionados

### 2. Catálogo de Serviços
- Lista completa de todos os serviços
- Filtros avançados por área, processo, status
- Busca por nome do serviço
- Visualização em grid ou lista

### 3. Detalhes do Serviço
- Informações completas sobre cada serviço
- Tempo médio, SLA, requisitos
- Breadcrumb de navegação
- Links para serviços relacionados

### 4. Sistema de Sugestões
- Sugerir novos serviços
- Propor melhorias em serviços existentes
- Acompanhamento de status das sugestões

## 🔧 Desenvolvimento

### Scripts Disponíveis:

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linting do código
```

### Estrutura de Pastas:

```
src/
├── components/      # Componentes reutilizáveis
├── hooks/          # Hooks customizados
├── pages/          # Páginas da aplicação
├── lib/            # Utilitários e configurações
├── integrations/   # Integrações externas (Supabase)
└── assets/         # Recursos estáticos
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Suporte

Para suporte, envie um email para [email] ou abra uma issue no repositório.
