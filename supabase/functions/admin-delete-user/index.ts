// Supabase Edge Function: admin-delete-user
//
// Securely deletes a user (auth.users + profiles row) using the service role
// key, but ONLY after verifying the caller is an authenticated admin.
//
// Why this exists:
//   The service role key bypasses RLS and grants full DB access. It must NEVER
//   be exposed in browser code. This function holds the key in the server-side
//   environment, validates the caller, then performs the privileged operation.
//
// Deploy:
//   supabase functions deploy admin-delete-user --project-ref <YOUR_REF>
//
// Required function secrets (auto-set by Supabase, but verify):
//   - SUPABASE_URL
//   - SUPABASE_ANON_KEY
//   - SUPABASE_SERVICE_ROLE_KEY

// @ts-expect-error - Deno runtime imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-expect-error - Deno runtime imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: 'Server misconfigured: missing Supabase env vars' }, 500);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser(token);
  if (userError || !userData?.user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }
  const callerId = userData.user.id;

  const { data: callerProfile, error: profileError } = await callerClient
    .from('profiles')
    .select('is_admin')
    .eq('id', callerId)
    .maybeSingle();

  if (profileError) {
    return json({ error: `Profile check failed: ${profileError.message}` }, 500);
  }
  if (!callerProfile?.is_admin) {
    return json({ error: 'Forbidden: caller is not an admin' }, 403);
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const targetUserId = body.userId;
  if (!targetUserId || typeof targetUserId !== 'string') {
    return json({ error: 'Missing required field: userId' }, 400);
  }

  if (targetUserId === callerId) {
    return json({ error: 'Cannot delete your own admin account' }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('id', targetUserId)
    .maybeSingle();

  if (targetProfile?.is_admin) {
    return json({ error: 'Cannot delete another admin account' }, 400);
  }

  const { error: deleteProfileError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', targetUserId);

  if (deleteProfileError) {
    return json({ error: `Failed to delete profile: ${deleteProfileError.message}` }, 500);
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (deleteUserError) {
    return json({ error: `Failed to delete auth user: ${deleteUserError.message}` }, 500);
  }

  return json({ ok: true, deletedId: targetUserId });
});
