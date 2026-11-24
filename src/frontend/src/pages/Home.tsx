import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

import DiscussSection from "@/components/proposal/DiscussSection";
import Footer from "@/components/proposal/Footer";
import Hero from "@/components/proposal/Hero";
import RaiseSection from "@/components/proposal/RaiseSection";
import VideoSection from "@/components/proposal/VideoSection";
import WaitlistSection from "@/components/proposal/WaitlistSection";

export default function Home() {
  // The waitlist form needs the actor context and a query client. When the
  // landing page is rendered without those providers, skip the additive
  // waitlist section so the fundraising one-pager still paints in full.
  const actorContext = useActor(createActor);

  return (
    <div data-ocid="page.home" className="min-h-screen bg-background">
      <Hero />
      <RaiseSection />
      <VideoSection />
      {actorContext ? <WaitlistSection /> : null}
      <DiscussSection />
      <Footer />
    </div>
  );
}
