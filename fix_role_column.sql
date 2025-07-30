-- Script para adicionar a coluna role à tabela profiles
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar coluna role à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;

-- Atualizar a coluna role com os valores da coluna perfil
UPDATE public.profiles SET role = perfil WHERE role IS NULL;

-- Criar trigger para sincronizar role com perfil
CREATE OR REPLACE FUNCTION sync_role_with_perfil()
RETURNS TRIGGER AS $$
BEGIN
  NEW.role = NEW.perfil;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sincronizar perfil com role
CREATE OR REPLACE FUNCTION sync_perfil_with_role()
RETURNS TRIGGER AS $$
BEGIN
  NEW.perfil = NEW.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers (remover se já existirem)
DROP TRIGGER IF EXISTS sync_role_on_perfil_update ON public.profiles;
DROP TRIGGER IF EXISTS sync_perfil_on_role_update ON public.profiles;
DROP TRIGGER IF EXISTS sync_role_on_insert ON public.profiles;

-- Criar triggers
CREATE TRIGGER sync_role_on_perfil_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.perfil IS DISTINCT FROM NEW.perfil)
  EXECUTE FUNCTION sync_role_with_perfil();

CREATE TRIGGER sync_perfil_on_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_perfil_with_role();

-- Trigger para INSERT
CREATE TRIGGER sync_role_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_with_perfil();

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position; 