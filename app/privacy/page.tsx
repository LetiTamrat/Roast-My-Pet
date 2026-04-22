import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Roast My Pet handles your photos, data, and IP addresses.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-12 sm:px-6">
        <article className="mx-auto max-w-2xl space-y-6 text-base leading-relaxed">
          <h1 className="font-display text-4xl font-bold">Privacy policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-display text-2xl font-bold">What we collect</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Pet photos.</strong> We store the photo you upload to generate a roast. We strip EXIF
              metadata client-side before uploading.
            </li>
            <li>
              <strong>Roast text &amp; meme images.</strong> Stored so your shareable link keeps working.
            </li>
            <li>
              <strong>Reactions, shares, and flags.</strong> Aggregate analytics only.
            </li>
            <li>
              <strong>Hashed IPs.</strong> We never store raw IP addresses. We hash them with a daily rotating
              salt to dedupe reactions and enforce rate limits.
            </li>
          </ul>

          <h2 className="font-display text-2xl font-bold pt-2">Retention</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Anonymous roasts where you didn&rsquo;t toggle &ldquo;public&rdquo; auto-delete after 30 days.</li>
            <li>Public gallery roasts stay until you request deletion.</li>
            <li>Analytics events (PostHog, Vercel) are retained per their default policies.</li>
          </ul>

          <h2 className="font-display text-2xl font-bold pt-2">Third parties</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Google Gemini.</strong> We send your photo to Gemini 2.5 Flash to generate a roast. Google&rsquo;s API terms apply.</li>
            <li><strong>Supabase.</strong> Storage and database.</li>
            <li><strong>Upstash.</strong> Rate limiting and caching.</li>
            <li><strong>Vercel.</strong> Hosting and Analytics.</li>
            <li><strong>PostHog.</strong> Product analytics.</li>
            <li><strong>Sentry.</strong> Error tracking.</li>
          </ul>

          <h2 className="font-display text-2xl font-bold pt-2">GDPR / CCPA delete request</h2>
          <p>
            To request deletion of a specific roast, click the &ldquo;Report this roast&rdquo; link on the share page,
            or email <a className="underline text-primary" href="mailto:privacy@roastmypet.com">privacy@roastmypet.com</a> with the
            short ID from the URL. We&rsquo;ll remove it within 7 days.
          </p>

          <h2 className="font-display text-2xl font-bold pt-2">Children</h2>
          <p>
            Roast My Pet is not directed at children under 13. Our moderation rejects photos where an
            identifiable minor is the main subject.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
