import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl">🐾</div>
          <h1 className="mt-6 font-display text-4xl font-bold">Nothing here.</h1>
          <p className="mt-2 text-muted-foreground">
            This roast walked off. But there are plenty more where it came from.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/upload">Roast my pet 🔥</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/gallery">Browse gallery</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
