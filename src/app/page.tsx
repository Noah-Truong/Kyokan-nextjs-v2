"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { RakuyuzSection } from "@/components/sections/RakuyuzSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { CTASection } from "@/components/sections/CTASection";
import { NewsTicker } from "@/components/ui/NewsTicker";
import { pageVariants } from "@/lib/animations";

export default function HomePage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {/* News Ticker */}
      <div className="pt-16 md:pt-18">
        <NewsTicker />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Services Section */}
      <ServicesSection />

      {/* RAKUYU-Z Section */}
      <RakuyuzSection />

      {/* About Section */}
      <AboutSection />

      {/* CTA Section */}
      <CTASection />
    </motion.div>
  );
}
