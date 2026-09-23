import { createClient } from '@supabase/supabase-js';
import { initialState, initialProfile, type State } from './model';
import { initialBilling, istanbulDistricts } from './commerce';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Account storage is unavailable');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function readState(userId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('zepe_accounts')
    .select('state, version')
    .eq('user_id', userId)
    .maybeSingle<{ state: string; version: number }>();

  if (error) throw error;
  if (!data) return { state: structuredClone(initialState), version: 0 };

  const stored = JSON.parse(data.state);
  const profile = { ...initialProfile, ...stored.profile, city: 'İstanbul' };
  if (!istanbulDistricts.includes(profile.district)) profile.district = '';
  return {
    state: { ...structuredClone(initialState), ...stored, profile, billing: { ...initialBilling, ...stored.billing } } as State,
    version: data.version,
  };
}

export async function writeState(userId: string, state: State, version: number) {
  const client = getClient();
  const newState = JSON.stringify(state);
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await client
    .from('zepe_accounts')
    .update({ state: newState, version: version + 1, updated_at: now })
    .eq('user_id', userId)
    .eq('version', version)
    .select('version')
    .maybeSingle<{ version: number }>();

  if (updateError) throw updateError;
  if (updated) return version + 1;

  const { data: inserted, error: insertError } = await client
    .from('zepe_accounts')
    .insert({ user_id: userId, state: newState, version: 1, updated_at: now })
    .select('version')
    .maybeSingle<{ version: number }>();

  if (insertError) {
    if (insertError.code === '23505') throw new Error('CONFLICT');
    throw insertError;
  }
  if (!inserted) throw new Error('CONFLICT');
  return 1;
}
