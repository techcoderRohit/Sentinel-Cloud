import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Brands from '@/components/Brands';
import KeyBenefits from '@/components/KeyBenefits';
import FeaturesGrid from '@/components/FeaturesGrid';
import FeatureHighlights from '@/components/FeatureHighlights';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import BlogSection from '@/components/BlogSection';
import Faq from '@/components/Faq';
import NewsletterCTA from '@/components/NewsletterCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        <Brands />
        <KeyBenefits />
        <FeaturesGrid />
        <FeatureHighlights />
        <Testimonials />
        <Pricing />
        <BlogSection />
        <Faq />
        <NewsletterCTA/>
      </main>

      <Footer />
    </div>
  );
}