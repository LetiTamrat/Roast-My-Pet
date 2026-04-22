import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Image
              src="/logo-sm.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
            />
            <span className="font-display">Roast My Pet</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            Every pet is cute. Some just deserve a little roasting.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold">
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
          <Link href="/gallery" className="hover:text-primary">Gallery</Link>
          <a href="https://twitter.com/intent/tweet?text=Check%20out%20Roast%20My%20Pet" className="hover:text-primary" aria-label="Share on X">X</a>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} Roast My Pet</span>
          <span>Made with unnecessary affection.</span>
        </div>
      </div>
    </footer>
  );
}
