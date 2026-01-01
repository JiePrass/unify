import ContactSection from "@/components/landing/contact";
import FAQSection from "@/components/landing/FAQ";
import FeatureSection from "@/components/landing/feature";
import HeroSection from "@/components/landing/hero";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <FeatureSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </>
  );
}
