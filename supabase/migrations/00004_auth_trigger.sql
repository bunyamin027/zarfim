-- ============================================================
-- Zarfım — Migration 00004: Auth Trigger
-- Yeni kullanıcı kaydolduğunda otomatik olarak:
--   1. public.users tablosuna profil satırı ekle
--   2. public.subscriptions tablosuna free abonelik ekle
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kullanıcı profili oluştur
  INSERT INTO public.users (id, email, locale, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'tr',
    'TRY'
  );

  -- Free abonelik kaydı oluştur
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (
    NEW.id,
    'free',
    'active'
  );

  RETURN NEW;
END;
$$;

-- Auth.users'a yeni kayıt olduğunda tetikle
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
