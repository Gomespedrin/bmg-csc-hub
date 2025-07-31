# Instruções para Corrigir o Erro de Recursão Infinita

## Problema Identificado

O erro `infinite recursion detected in policy for relation "profiles"` está acontecendo porque as políticas RLS (Row Level Security) estão criando um loop infinito:

1. Quando um usuário tenta acessar a tabela `profiles`, a política verifica se ele é administrador
2. Para verificar se é administrador, a política faz uma consulta na própria tabela `profiles`
3. Essa consulta dispara novamente as políticas RLS
4. Isso cria um loop infinito

## Solução

### Passo 1: Executar o Script de Correção das Políticas

1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `fix_rls_recursion.sql` que foi criado

Este script vai:
- Remover as políticas problemáticas que causam recursão
- Criar funções auxiliares (`is_admin()` e `can_create_suggestions()`) que evitam a recursão
- Recriar as políticas usando essas funções

### Passo 2: Verificar e Corrigir o Perfil do Usuário

1. No **SQL Editor** do Supabase
2. Execute o script `fix_user_profile_final.sql`

Este script vai:
- Verificar se o usuário atual tem um perfil
- Criar um perfil se não existir
- Definir o usuário como administrador para resolver o problema de acesso
- Testar se as funções estão funcionando

### Passo 3: Testar a Aplicação

1. Recarregue a página da aplicação
2. Tente acessar a área de "Usuários" novamente
3. Verifique se os erros no console foram resolvidos

## Arquivos Criados

- `fix_rls_recursion.sql` - Corrige as políticas RLS
- `fix_user_profile_final.sql` - Verifica e corrige o perfil do usuário
- `INSTRUCOES_CORRECAO.md` - Este arquivo com as instruções

## Explicação Técnica

O problema estava nas políticas RLS que usavam consultas diretas na tabela `profiles` para verificar permissões. Isso criava um loop porque:

```sql
-- Política problemática (causava recursão)
CREATE POLICY "Administradores podem gerenciar perfis" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND perfil = 'superadministrador'
    )
  );
```

A solução foi criar funções auxiliares com `SECURITY DEFINER` que evitam a recursão:

```sql
-- Função corrigida (não causa recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND perfil IN ('administrador', 'superadministrador')
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Se o Problema Persistir

Se após executar os scripts o problema ainda persistir:

1. Verifique se todos os scripts foram executados com sucesso
2. Confirme que o usuário tem um perfil válido na tabela `profiles`
3. Verifique se as funções `is_admin()` e `can_create_suggestions()` foram criadas
4. Teste as funções diretamente no SQL Editor

## Contato

Se precisar de ajuda adicional, verifique os logs de erro no console do navegador e no Supabase Dashboard. 