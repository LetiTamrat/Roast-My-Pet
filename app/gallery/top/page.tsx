import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TopList } from "./top-list";

export const metadata: Metadata = {
  title: "Top roasts",
  description: "The highest-voted pet roasts of all time. Ranked by reactions.",
};

export const revalidate = 300;

export default function TopRoastsPage() {
  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Top roasts</h1>
            <p className="mt-3 text-muted-foreground">
              Decided by real reactions from real human fingers.
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <Tabs defaultValue="today" className="w-full max-w-md">
              <TabsList className="w-full">
                <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
                <TabsTrigger value="week" className="flex-1">This week</TabsTrigger>
                <TabsTrigger value="all" className="flex-1">All time</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                <TopList period="today" />
              </TabsContent>
              <TabsContent value="week">
                <TopList period="week" />
              </TabsContent>
              <TabsContent value="all">
                <TopList period="all" />
              </TabsContent>
            </Tabs>
          </div>
          <div className="mt-10 text-center">
            <Button asChild>
              <Link href="/upload">Aim for #1 →</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
