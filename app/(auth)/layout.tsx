import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[70vh] px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </>
  );
}
