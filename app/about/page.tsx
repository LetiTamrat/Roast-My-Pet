import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About",
  description: "What Roast My Pet is, why we made it, and how it works.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-12 sm:px-6">
        <article className="mx-auto max-w-2xl space-y-6 text-base leading-relaxed">
          <h1 className="font-display text-4xl font-bold">About</h1>
          <p>
            <strong>Roast My Pet</strong> is a very silly web app that looks at your pet and writes a short, specific,
            surprisingly accurate roast. Then it wraps that roast in a meme you can share.
          </p>
          <p>
            It is free. There is no signup. We don&rsquo;t sell your data. The whole point of the thing is that it&rsquo;s
            shareable &mdash; every meme carries our watermark, and that&rsquo;s how we grow.
          </p>
          <h2 className="font-display text-2xl font-bold pt-4">How it works</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>You upload a photo. We strip the EXIF metadata in your browser before it leaves your device.</li>
            <li>We moderate the image: no humans as subjects, no NSFW, no distress.</li>
            <li>Gemini 2.5 Flash reviews the photo and writes an original roast tuned to the level you picked.</li>
            <li>We render a meme image on our server and give you back the share URL.</li>
          </ol>
          <h2 className="font-display text-2xl font-bold pt-4">What we don&rsquo;t do</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We don&rsquo;t train models on your photos.</li>
            <li>We don&rsquo;t log raw IP addresses.</li>
            <li>We don&rsquo;t keep your photo after 30 days unless you opt in to the public gallery.</li>
          </ul>
          <h2 className="font-display text-2xl font-bold pt-4">Contact</h2>
          <p>
            Questions, press, partnership, complaints from cats: email us at{" "}
            <a className="underline text-primary" href="mailto:hello@roastmypet.com">hello@roastmypet.com</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
