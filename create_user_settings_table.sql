-- Criar tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications JSONB DEFAULT '{"email": true, "push": false, "suggestions": true, "updates": false}'::jsonb,
  privacy JSONB DEFAULT '{"profileVisibility": "public", "showEmail": true, "showActivity": false}'::jsonb,
  appearance JSONB DEFAULT '{"theme": "system", "compactMode": false, "showAnimations": true}'::jsonb,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias configurações" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias configurações" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias configurações" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se a tabela foi criada
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_settings'; 