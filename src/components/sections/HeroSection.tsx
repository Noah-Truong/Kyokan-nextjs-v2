"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";
import { useCountUp } from "@/hooks/useAnimations";

const stats = [
  { value: 30, suffix: "年以上", label: "業界実績" },
  { value: 19, suffix: "件+", label: "施工事例" },
  { value: 50, suffix: "年", label: "配管延命技術" },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center bg-primary-950"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/photos/pomp.png"
          alt=""
          fill
          className="object-cover"
          priority
          quality={100}
          sizes="100vw"
          unoptimized
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-primary-950/10" />
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="container-custom relative z-10 py-16 sm:py-20 md:py-32">
        <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
          {/* Award badge - subtle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary-950/80 backdrop-blur-sm rounded-full text-sm text-white font-medium text-shadow-sm border border-white/20"
          >
            <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>インフラメンテナンス大賞 優秀賞受賞</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-display-md sm:text-display-lg md:text-display-xl font-bold text-white mb-5 leading-tight text-shadow-lg"
          >
            RAKUYU-Z工法で、
            <br />
            <span className="text-accent-300">断水のない水道工事を</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white mb-8 max-w-md leading-relaxed text-shadow font-medium"
          >
            RAKUYU-Z工法は、供用中の下水道関連工事において、周辺環境の衛生面や安全面、本工事の施工性と品質確保に応える不断水水替工法です。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-12"
          >
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">
                お問い合わせ
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </Button>
            <Button variant="white" size="lg" asChild>
              <Link href="/construction">工法について詳しく</Link>
            </Button>
          </motion.div>

          {/* Stats - simple horizontal layout */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-white/20"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={staggerItemVariants}>
                <div className="text-2xl md:text-3xl font-bold text-white text-shadow">
                  <StatNumber value={stat.value} />
                  <span className="text-base text-white/90 ml-1 font-medium">{stat.suffix}</span>
                </div>
                <div className="text-sm text-white/70 mt-1 font-medium text-shadow-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Simple scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border border-white/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatNumber({ value }: { value: number }) {
  const count = useCountUp(value, 1500, 0, true);
  return <>{count}</>;
}
