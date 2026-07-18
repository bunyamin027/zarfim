-- ============================================================
-- Zarfım — Migration 00001: Tabloların Oluşturulması
-- CLAUDE.md bölüm 4'teki veri modeli
-- ============================================================

-- 1. users — Kullanıcı profili
-- auth.users ile 1:1 ilişki, auth.uid() referansı
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  locale      TEXT NOT NULL DEFAULT 'tr' CHECK (locale IN ('tr', 'ar', 'en')),
  currency    TEXT NOT NULL DEFAULT 'TRY',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. households — Aile paylaşımı (premium özellik)
CREATE TABLE IF NOT EXISTS public.households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. household_members — Aile üyeleri
CREATE TABLE IF NOT EXISTS public.household_members (
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, user_id)
);

-- 4. envelopes — Zarflar (bütçe kategorileri)
-- user_id: kişisel zarf sahibi
-- household_id: aile zarfı (nullable, premium)
CREATE TABLE IF NOT EXISTS public.envelopes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id  UUID REFERENCES public.households(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT '📁',
  monthly_limit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_limit >= 0),
  color         TEXT NOT NULL DEFAULT '#6F8F6A',
  is_recurring  BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. transactions — Harcamalar
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id UUID NOT NULL REFERENCES public.envelopes(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  merchant    TEXT,
  note        TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. subscriptions — Abonelik durumu (RevenueCat ile senkron)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  revenuecat_app_user_id  TEXT,
  tier                    TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_envelopes_user_id ON public.envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_envelopes_household_id ON public.envelopes(household_id);
CREATE INDEX IF NOT EXISTS idx_transactions_envelope_id ON public.transactions(envelope_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON public.transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
