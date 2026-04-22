"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LayoutGrid, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HeaderProfile {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
}

interface Props {
  profile: HeaderProfile | null;
  email: string | null;
}

export function HeaderNav({ profile, email }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
          aria-label="Roast My Pet home"
        >
          <Image
            src="/logo-sm.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0"
          />
          <span className="font-display">Roast My Pet</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <Link href="/gallery" className="rounded-full px-4 py-2 hover:bg-muted transition-colors">
            Gallery
          </Link>
          <Link href="/gallery/top" className="rounded-full px-4 py-2 hover:bg-muted transition-colors">
            Top Roasts
          </Link>
          <Link href="/about" className="rounded-full px-4 py-2 hover:bg-muted transition-colors">
            About
          </Link>
        </nav>
        {profile ? (
          <UserMenu profile={profile} email={email} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function UserMenu({ profile, email }: { profile: HeaderProfile; email: string | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card shadow-soft transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName || profile.username}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="font-semibold text-foreground">
            {profile.displayName || `@${profile.username}`}
          </div>
          {email && <div className="truncate text-xs">{email}</div>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-roasts">
            <LayoutGrid className="h-4 w-4" /> My roasts
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${profile.username}`}>
            <User className="h-4 w-4" /> View profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        {profile.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck className="h-4 w-4" /> Moderation
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild destructive>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex w-full items-center gap-2 text-left">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
