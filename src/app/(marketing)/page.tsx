import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TeacherBio } from "@/components/home/TeacherBio";
import { PinnedHomeBanner } from "@/components/announcements/PinnedHomeBanner";

export default function HomePage() {
  return (
    <>
      <PinnedHomeBanner />
      <HeroSection />
      <FeaturesSection />
      <TeacherBio />
    </>
  );
}
