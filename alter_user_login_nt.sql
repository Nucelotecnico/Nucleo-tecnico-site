-- Adds new user profile fields to user_login_nt
ALTER TABLE public.user_login_nt
  ADD COLUMN IF NOT EXISTS nome_usuario text,
  ADD COLUMN IF NOT EXISTS matricula text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS data_nasc date;
