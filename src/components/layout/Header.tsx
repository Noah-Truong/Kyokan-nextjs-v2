"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHeaderScroll } from "@/hooks/useAnimations";
import { Button } from "@/components/ui/Button";
import { navigationItems } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useHeaderScroll(20);
  const pathname = usePathname();
  
  // Always show solid white header
  const showSolidHeader = true;

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          showSolidHeader
            ? "bg-white border-b border-slate-200 shadow-subtle"
            : "bg-primary-950/70"
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 -ml-6 sm:-ml-16 lg:-ml-32 ">
              <div className="relative w-32 h-16 sm:w-48 sm:h-24 lg:w-64 lg:h-32 flex-shrink-0">
                <Image
                  src="/photos/logo_01.png"
                  alt="ラクユーZ工法協会"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 128px, (max-width: 1024px) 192px, 256px"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap",
                    showSolidHeader
                      ? pathname === item.href
                        ? "text-accent-600"
                        : "text-slate-600 hover:text-primary-900 hover:bg-slate-50"
                      : pathname === item.href
                      ? "text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="ml-3">
                <Button variant={showSolidHeader ? "primary" : "white"} size="sm" asChild>
                  <Link href="/contact" aria-label="お問い合わせ">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                  </Link>
                </Button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded transition-colors flex-shrink-0",
                showSolidHeader ? "hover:bg-slate-100" : "hover:bg-white/10"
              )}
              aria-label="メニュー"
            >
              <motion.span
                animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 6 : 0 }}
                className={cn("w-5 h-0.5 rounded-full", showSolidHeader ? "bg-primary-900" : "bg-white")}
              />
              <motion.span
                animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                className={cn("w-5 h-0.5 rounded-full", showSolidHeader ? "bg-primary-900" : "bg-white")}
              />
              <motion.span
                animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -6 : 0 }}
                className={cn("w-5 h-0.5 rounded-full", showSolidHeader ? "bg-primary-900" : "bg-white")}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-primary-950 lg:hidden"
          >
            <div className="flex flex-col justify-center items-center h-full">
              {/* Mobile Logo */}
              <div className="absolute top-4 left-6">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <div className="relative w-32 h-16">
                    <Image
                      src="/photos/logo_01.png"
                      alt="ラクユーZ工法協会"
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>
              </div>

              <nav className="flex flex-col items-center gap-4">
                {navigationItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-xl font-medium transition-colors whitespace-nowrap",
                        pathname === item.href ? "text-accent-400" : "text-white hover:text-accent-300"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * navigationItems.length }}
                  className="mt-4"
                >
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      お問い合わせ
                    </Link>
                  </Button>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
