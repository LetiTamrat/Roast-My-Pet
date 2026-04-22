import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LiveRoastWall } from "@/components/live-roast-wall";
import { HeroCardStack } from "./_components/hero-card-stack";
import { RoastLevelsDemo } from "./_components/roast-levels-demo";

const FAQS = [
  {
    q: "Is this free?",
    a: "Yes, totally free. We run on caffeine and your pet's shame.",
  },
  {
    q: "Do you store my pet's photo?",
    a: "Only if you opt in to the public gallery. Otherwise it's auto-deleted after 30 days, no strings attached.",
  },
  {
    q: "Will it be mean?",
    a: "Only as mean as you ask. Pick Cute for gentle teasing or Savage if your pet has it coming.",
  },
  {
    q: "Can I share it?",
    a: "It's literally built for sharing. One tap to Instagram, TikTok, X, or WhatsApp.",
  },
  {
    q: "Does it work on cats / birds / lizards?",
    a: "Yes. Anything with a face. Some things without.",
  },
];

const STEPS = [
  { n: "1", title: "Upload", body: "Any photo of your pet. Blurry counts." },
  { n: "2", title: "Add details", body: "Name, vibe, roast level. Or skip it." },
  { n: "3", title: "Get roasted", body: "Download. Share. Make the group chat weep." },
];

export default function LandingPage() {
  return (
    <>
      <Header />
      <main id="main" className="relative overflow-x-hidden">
        {/* HERO */}
        <section className="relative isolate px-4 sm:px-6 pt-12 pb-24 md:pt-16 md:pb-28">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[560px] max-w-6xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,90,31,0.18),transparent)]"
            aria-hidden
          />
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold shadow-soft">
                <span aria-hidden>🎉</span>
                Over a thousand pets humbled. No refunds.
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl">
                Your pet has been <span className="text-primary">getting away</span> with too much.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                Upload a photo. Get an AI-generated roast and a meme so good your group chat will riot.
                Free, no signup.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="xl" className="animate-pulse-glow">
                  <Link href="/upload">Roast My Pet 🔥</Link>
                </Button>
                <div className="text-sm text-muted-foreground">
                  4–8 seconds per roast · Works on cats, dogs, and whatever that is
                </div>
              </div>
            </div>
            <HeroCardStack />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-2 text-muted-foreground">Three steps. Done in a minute.</p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="paper-grain rounded-3xl border border-border bg-card p-8 shadow-soft"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {s.n}
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIVE ROAST WALL */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold md:text-4xl">Fresh roasts</h2>
                <p className="mt-2 text-muted-foreground">The gallery, live. Click any pet to see the full roast.</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link href="/gallery">See all →</Link>
              </Button>
            </div>
            <div className="mt-8">
              <LiveRoastWall />
            </div>
          </div>
        </section>

        {/* ROAST LEVELS DEMO */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Pick your heat level</h2>
            <p className="mt-2 text-muted-foreground">Same pet. Three levels of honesty.</p>
            <div className="mt-8">
              <RoastLevelsDemo />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Frequently asked</h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* BIG CTA */}
        <section className="px-4 sm:px-6 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl bg-primary px-6 py-16 text-center shadow-card md:py-20">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
              Let's hear it for the chaos gremlin.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              One photo. One roast. Infinite group-chat mileage.
            </p>
            <Button asChild size="xl" variant="secondary" className="mt-8">
              <Link href="/upload">Roast My Pet 🔥</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
