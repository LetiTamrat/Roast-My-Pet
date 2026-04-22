import { HeaderNav, type HeaderProfile } from "./header-nav";
import { getSession } from "@/lib/auth/session";

export async function Header() {
  const session = await getSession().catch(() => null);
  const profile: HeaderProfile | null = session?.profile
    ? {
        username: session.profile.username,
        displayName: session.profile.display_name,
        avatarUrl: session.profile.avatar_url,
        role: session.profile.role,
      }
    : null;
  return <HeaderNav profile={profile} email={session?.email || null} />;
}
