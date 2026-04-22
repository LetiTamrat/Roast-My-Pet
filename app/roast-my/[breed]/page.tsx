import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

const DOG_BREEDS = [
  "labrador", "golden-retriever", "german-shepherd", "french-bulldog", "bulldog",
  "poodle", "beagle", "rottweiler", "dachshund", "yorkie", "boxer", "husky",
  "great-dane", "pug", "corgi", "shih-tzu", "chihuahua", "border-collie",
  "australian-shepherd", "cavalier", "bernese-mountain-dog", "mastiff",
  "maltese", "havanese", "pomeranian", "doberman", "shiba-inu", "akita",
  "weimaraner", "cane-corso", "basset-hound", "pitbull", "greyhound",
  "jack-russell", "cocker-spaniel", "dalmatian", "samoyed", "bichon-frise",
  "schnauzer", "german-shorthaired-pointer", "vizsla", "whippet", "papillon",
  "collie", "bullmastiff", "boston-terrier", "irish-setter", "saint-bernard",
  "newfoundland", "staffordshire-terrier",
];
const CAT_BREEDS = [
  "maine-coon", "persian", "ragdoll", "siamese", "british-shorthair",
  "sphynx", "bengal", "abyssinian", "scottish-fold", "russian-blue",
  "devon-rex", "oriental", "burmese", "himalayan", "american-shorthair",
  "birman", "tonkinese", "cornish-rex", "savannah", "norwegian-forest",
  "turkish-angora", "singapura", "ocicat", "manx", "balinese",
  "exotic-shorthair", "chartreux", "somali", "egyptian-mau", "japanese-bobtail",
];
const ALL = [...DOG_BREEDS, ...CAT_BREEDS];

function titleize(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

function isCat(slug: string) {
  return CAT_BREEDS.includes(slug);
}

export function generateStaticParams() {
  return ALL.map((breed) => ({ breed }));
}

interface Props {
  params: Promise<{ breed: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed } = await params;
  if (!ALL.includes(breed)) return {};
  const label = titleize(breed);
  return {
    title: `Roast my ${label}`,
    description: `Upload a photo of your ${label} and get a hilarious AI-generated roast in seconds.`,
  };
}

export default async function BreedLanding({ params }: Props) {
  const { breed } = await params;
  if (!ALL.includes(breed)) notFound();
  const label = titleize(breed);
  const petKind = isCat(breed) ? "cat" : "dog";

  return (
    <>
      <Header />
      <main className="px-4 pb-24 pt-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl md:text-6xl">
            Roast my {label}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every {label} thinks they're better than you. The data disagrees.
            Upload a photo and let the AI confirm your suspicions in about 6 seconds.
          </p>
          <div className="mt-8">
            <Button asChild size="xl">
              <Link href={`/upload?type=${petKind}`}>Roast my {label} 🔥</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl grid gap-6 md:grid-cols-3">
          {["Cute", "Medium", "Savage"].map((level, i) => (
            <div
              key={level}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="text-sm font-bold uppercase tracking-wider text-primary">
                {level}
              </div>
              <p className="mt-3 font-display text-lg font-bold">
                {sampleRoast(label, i)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild>
            <Link href="/upload">Roast my pet →</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}

function sampleRoast(breed: string, level: number) {
  const cute = `Every ${breed} carries themselves like they invented the concept of being cute. The nerve.`;
  const medium = `${breed}s stare at the door for seven minutes before remembering they wanted to be on the other side.`;
  const savage = `A ${breed} has the strategic planning skills of a disconnected Roomba and the ego of a minor European monarch.`;
  return [cute, medium, savage][level];
}
