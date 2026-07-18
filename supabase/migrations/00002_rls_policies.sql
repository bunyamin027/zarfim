-- ============================================================
-- Zarfım — Migration 00002: Row Level Security Politikaları
-- CLAUDE.md: "finansal veri olduğu için her tabloda RLS zorunlu"
-- ============================================================

-- ────────────────────────────────────────────
-- Helper function: Kullanıcının bir household'a üye olup olmadığını kontrol et
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

-- Helper: Bir zarfın sahibi mi (direkt veya household üzerinden)?
CREATE OR REPLACE FUNCTION public.owns_envelope(p_envelope_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.envelopes e
    WHERE e.id = p_envelope_id
      AND (
        e.user_id = auth.uid()
        OR (
          e.household_id IS NOT NULL
          AND public.is_household_member(e.household_id)
        )
      )
  );
$$;

-- ════════════════════════════════════════════
-- 1. users
-- ════════════════════════════════════════════
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ════════════════════════════════════════════
-- 2. households
-- ════════════════════════════════════════════
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "households_select_member" ON public.households
  FOR SELECT USING (public.is_household_member(id));

CREATE POLICY "households_insert" ON public.households
  FOR INSERT WITH CHECK (true);
  -- Not: Insert sonrası household_members'a owner kaydı trigger ile eklenecek

CREATE POLICY "households_update_owner" ON public.households
  FOR UPDATE USING (public.is_household_owner(id))
  WITH CHECK (public.is_household_owner(id));

CREATE POLICY "households_delete_owner" ON public.households
  FOR DELETE USING (public.is_household_owner(id));

-- ════════════════════════════════════════════
-- 3. household_members
-- ════════════════════════════════════════════
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hm_select_own_household" ON public.household_members
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "hm_insert_owner" ON public.household_members
  FOR INSERT WITH CHECK (public.is_household_owner(household_id));

CREATE POLICY "hm_update_owner" ON public.household_members
  FOR UPDATE USING (public.is_household_owner(household_id))
  WITH CHECK (public.is_household_owner(household_id));

CREATE POLICY "hm_delete_owner" ON public.household_members
  FOR DELETE USING (public.is_household_owner(household_id));

-- ════════════════════════════════════════════
-- 4. envelopes
-- ════════════════════════════════════════════
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "envelopes_select_own" ON public.envelopes
  FOR SELECT USING (
    user_id = auth.uid()
    OR (household_id IS NOT NULL AND public.is_household_member(household_id))
  );

CREATE POLICY "envelopes_insert_own" ON public.envelopes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "envelopes_update_own" ON public.envelopes
  FOR UPDATE USING (
    user_id = auth.uid()
    OR (household_id IS NOT NULL AND public.is_household_owner(household_id))
  ) WITH CHECK (
    user_id = auth.uid()
    OR (household_id IS NOT NULL AND public.is_household_owner(household_id))
  );

CREATE POLICY "envelopes_delete_own" ON public.envelopes
  FOR DELETE USING (
    user_id = auth.uid()
    OR (household_id IS NOT NULL AND public.is_household_owner(household_id))
  );

-- ════════════════════════════════════════════
-- 5. transactions
-- ════════════════════════════════════════════
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (public.owns_envelope(envelope_id));

CREATE POLICY "transactions_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (public.owns_envelope(envelope_id));

CREATE POLICY "transactions_update_own" ON public.transactions
  FOR UPDATE USING (public.owns_envelope(envelope_id))
  WITH CHECK (public.owns_envelope(envelope_id));

CREATE POLICY "transactions_delete_own" ON public.transactions
  FOR DELETE USING (public.owns_envelope(envelope_id));

-- ════════════════════════════════════════════
-- 6. subscriptions
-- ════════════════════════════════════════════
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi aboneliğini okuyabilir
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- INSERT ve UPDATE sadece service_role ile (RevenueCat webhook / Edge Function)
-- Anon/authenticated kullanıcılar abonelik oluşturamaz/değiştiremez
CREATE POLICY "subscriptions_insert_service" ON public.subscriptions
  FOR INSERT WITH CHECK (false);
  -- Service role RLS'yi bypass eder, bu policy sadece normal kullanıcıları engeller

CREATE POLICY "subscriptions_update_service" ON public.subscriptions
  FOR UPDATE USING (false) WITH CHECK (false);
