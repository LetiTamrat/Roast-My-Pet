import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UploadForm } from "./upload-form";

export const metadata: Metadata = {
  title: "Roast my pet — Upload a photo",
  description: "Upload a photo of your pet to get a free AI-generated roast and meme.",
};

export default function UploadPage() {
  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-12 pb-24 sm:px-6">
        <div className="mx-auto w-full max-w-[720px]">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              Bring the culprit forward.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Upload a photo and give us the receipts. We'll do the rest in about 6 seconds.
            </p>
          </div>
          <div className="mt-10">
            <UploadForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
