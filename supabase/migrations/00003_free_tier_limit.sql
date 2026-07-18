-- ============================================================
-- Zarfım — Migration 00003: Free Tier Zarf Sınırı
-- CLAUDE.md: "Free katmanda envelopes sayısı 3 ile sınırlı —
-- bu sınır client'ta değil, Edge Function/RLS seviyesinde de
-- doğrulanmalı"
-- ============================================================

-- Trigger fonksiyonu: INSERT öncesi kontrol
CREATE OR REPLACE FUNCTION public.check_envelope_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier TEXT;
  v_count INTEGER;
BEGIN
  -- Kullanıcının abonelik seviyesini al
  SELECT tier INTO v_tier
  FROM public.subscriptions
  WHERE user_id = NEW.user_id
    AND status IN ('active', 'trial');

  -- Abonelik kaydı yoksa free kabul et
  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Premium kullanıcılar sınırsız zarf oluşturabilir
  IF v_tier = 'premium' THEN
    RETURN NEW;
  END IF;

  -- Free kullanıcı için mevcut kişisel zarf sayısını kontrol et
  SELECT count(*) INTO v_count
  FROM public.envelopes
  WHERE user_id = NEW.user_id
    AND household_id IS NULL;  -- Sadece kişisel zarflar sayılır

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Free kullanıcılar en fazla 3 zarf oluşturabilir. Premium''a yükseltin!'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: envelopes INSERT öncesi çalışır
CREATE TRIGGER trg_check_envelope_limit
  BEFORE INSERT ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_envelope_limit();
