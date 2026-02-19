import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { BiographySection } from "@/components/BiographySection";
import { MusicSection } from "@/components/MusicSection";
import { BandSection } from "@/components/BandSection";
import { AuraSection } from "@/components/AuraSection";
import { LiveGigsSection } from "@/components/LiveGigsSection";
import { ContactSection } from "@/components/ContactSection";
import { GrainOverlay } from "@/components/GrainOverlay";

const Index = () => {
  return (
    <main className="bg-background min-h-screen">
      <GrainOverlay />
      <Navigation />
      <HeroSection />
      <BiographySection />
      <AuraSection />
      <MusicSection />
      <BandSection />
      <LiveGigsSection />
      <ContactSection />
    </main>
  );
};

export default Index;
