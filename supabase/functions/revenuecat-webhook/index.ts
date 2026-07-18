// @ts-nocheck
/**
 * RevenueCat Webhook Handler — Supabase Edge Function
 *
 * RevenueCat'ten gelen subscription olaylarını karşılar ve
 * public.subscriptions tablosunu günceller.
 *
 * Dağıtım:
 *   supabase functions deploy revenuecat-webhook
 *
 * RevenueCat Dashboard'da webhook URL olarak:
 *   https://YOUR_PROJECT.supabase.co/functions/v1/revenuecat-webhook
 *
 * Environment variables (Supabase Dashboard > Edge Functions > Secrets):
 *   REVENUECAT_WEBHOOK_SECRET — RevenueCat > Webhooks > Signing Secret
 *   SUPABASE_SERVICE_ROLE_KEY — otomatik tanımlı
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase service role client — RLS bypass
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── RevenueCat olay tipleri ───────────────────────
type RCEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'REFUND'
  | 'SUBSCRIPTION_PAUSED'
  | 'TRANSFER'
  | 'TEST';

interface RCEvent {
  type: RCEventType;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  expiration_at_ms: number | null;
  environment: 'SANDBOX' | 'PRODUCTION';
  store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE';
}

interface RCWebhookPayload {
  api_version: string;
  event: RCEvent;
}

// ─── Ana handler ───────────────────────────────────
Deno.serve(async (req) => {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Webhook secret doğrulama
  if (webhookSecret) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.error('Invalid webhook secret');
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const payload: RCWebhookPayload = await req.json();
    const event = payload.event;

    console.log(`RevenueCat event: ${event.type} for user: ${event.app_user_id}`);

    // Test olaylarını logla ama işleme
    if (event.type === 'TEST') {
      console.log('Test event received — skipping DB update');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // app_user_id = Supabase auth.uid()
    const userId = event.app_user_id;

    // Abonelik durumunu belirle
    let tier: 'free' | 'premium' = 'free';
    let status: 'active' | 'expired' | 'cancelled' | 'trial' = 'active';
    let currentPeriodEnd: string | null = null;

    if (event.expiration_at_ms) {
      currentPeriodEnd = new Date(event.expiration_at_ms).toISOString();
    }

    switch (event.type) {
      case 'INITIAL_PURCHASE':
        tier = 'premium';
        status = 'active';
        break;

      case 'RENEWAL':
        tier = 'premium';
        status = 'active';
        break;

      case 'CANCELLATION':
        // İptal edildi ama dönem sonuna kadar premium
        tier = 'premium';
        status = 'cancelled';
        break;

      case 'UNCANCELLATION':
        tier = 'premium';
        status = 'active';
        break;

      case 'EXPIRATION':
        tier = 'free';
        status = 'expired';
        break;

      case 'REFUND':
        tier = 'free';
        status = 'expired';
        break;

      case 'BILLING_ISSUE':
        // Ödeme sorunu — şimdilik premium tut, birkaç gün sonra expire olur
        tier = 'premium';
        status = 'active';
        break;

      case 'PRODUCT_CHANGE':
        // Ürün değişikliği — şimdilik tek ürün var
        tier = 'premium';
        status = 'active';
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    // Subscriptions tablosunu güncelle (service role — RLS bypass)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        tier,
        status,
        current_period_end: currentPeriodEnd,
        revenuecat_app_user_id: event.original_app_user_id,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Supabase update error:', updateError);

      // Kullanıcı bulunamadıysa, insert dene
      if (updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            tier,
            status,
            current_period_end: currentPeriodEnd,
            revenuecat_app_user_id: event.original_app_user_id,
          });

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Database update failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Database update failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    console.log(`Updated subscription for ${userId}: tier=${tier}, status=${status}`);

    return new Response(
      JSON.stringify({ received: true, tier, status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
