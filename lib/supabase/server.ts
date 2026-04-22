import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

let serviceClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

export function supabaseService(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase service client missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceClient;
}

export function supabaseAnonServer(): SupabaseClient {
  if (anonClient) return anonClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase anon server client missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  anonClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}

/**
 * Authed server client for Route Handlers and Server Components.
 * Reads/writes the Supabase auth cookie via next/headers so the user's
 * session travels across server ↔ client without plumbing.
 */
export async function supabaseRoute(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "supabaseRoute missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return store.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => {
            store.set(name, value, options as CookieOptions);
          });
        } catch {
          // Server Components cannot mutate cookies. The middleware is
          // responsible for refreshing tokens — this no-op is expected.
        }
      },
    },
  });
}

export const UPLOAD_BUCKET = "pet-uploads";
export const MEMES_BUCKET = "memes";
export const AVATARS_BUCKET = "avatars";

export function storagePublicUrl(bucket: string, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}
