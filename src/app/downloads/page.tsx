"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/animations";
import {
  fetchDocuments,
  isWpConfigured,
  DOC_CATEGORY_META,
  MOCK_DOCUMENTS,
  formatWpDate,
  type WpDocument,
  type DocCategory,
} from "@/lib/wordpress";

const DOC_CATEGORY_ORDER: DocCategory[] = [
  "catalog",
  "technical-spec",
  "construction-manual",
  "design-reference",
];

const CATEGORY_ICONS: Record<DocCategory, React.ReactNode> = {
  catalog: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  "technical-spec": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  "construction-manual": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  "design-reference": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
};

function DocCard({ doc }: { doc: WpDocument }) {
  const cat = doc.docCategory;
  const meta = cat ? DOC_CATEGORY_META[cat] : null;
  const desc =
    doc.acf?.short_description ||
    doc.excerpt?.rendered?.replace(/<[^>]*>/g, "").trim() ||
    "";
  const fileUrl = doc.acf?.file_url ?? "#";
  const fileSize = doc.acf?.file_size;

  return (
    <motion.div
      variants={staggerItemVariants}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-primary-900 text-sm leading-snug mb-1"
            dangerouslySetInnerHTML={{ __html: doc.title.rendered }}
          />
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
        </div>
        {/* PDF icon */}
        <div className="shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5h-.8v-4h.8v1.6h1.2v-1.6h.8v4h-.8V16H8.5v1.5zm3.7 0H11V13.5h1.2c1.1 0 1.8.6 1.8 2s-.7 2-1.8 2zm1-2c0-.9-.4-1.3-1-1.3h-.4v2.5h.4c.6 0 1-.4 1-1.2zm3.3 0h-1.2v1.3h1.4v.7h-2.2v-4h2.2v.7h-1.4v1.3z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {fileSize && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {fileSize}
            </span>
          )}
          <span>{formatWpDate(doc.date)}</span>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          ダウンロード
        </a>
      </div>
    </motion.div>
  );
}

export default function DownloadsPage() {
  const [docs, setDocs] = useState<WpDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DocCategory | "all">("all");

  useEffect(() => {
    if (!isWpConfigured()) {
      setDocs(MOCK_DOCUMENTS);
      setLoading(false);
      return;
    }
    fetchDocuments()
      .then(setDocs)
      .catch(() => setDocs(MOCK_DOCUMENTS))
      .finally(() => setLoading(false));
  }, []);

  const grouped = DOC_CATEGORY_ORDER.reduce<Record<DocCategory, WpDocument[]>>(
    (acc, cat) => {
      acc[cat] = docs.filter((d) => d.docCategory === cat);
      return acc;
    },
    {} as Record<DocCategory, WpDocument[]>
  );

  const visibleCategories =
    activeCategory === "all"
      ? DOC_CATEGORY_ORDER
      : ([activeCategory] as DocCategory[]);

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-primary-950">
        <div className="absolute inset-0">
          <Image
            src="/photos/water.png"
            alt=""
            fill
            className="object-cover"
            priority
            quality={100}
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-primary-950/65" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-white"
          >
            <span className="section-label text-accent-400">Downloads</span>
            <h1 className="text-display-md md:text-display-lg font-semibold text-white mb-4">
              資料ダウンロード
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              カタログ・技術仕様書・施工マニュアル・設計参考図をダウンロードできます。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-slate-50 border-b border-slate-200 sticky top-16 z-20">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-3 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                activeCategory === "all"
                  ? "bg-accent-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              すべて
            </button>
            {DOC_CATEGORY_ORDER.map((cat) => {
              const meta = DOC_CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-3 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? "bg-accent-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Document Sections */}
      <section className="section">
        <div className="container-custom space-y-16 max-w-5xl mx-auto">
          {loading
            ? Array.from({ length: 2 }).map((_, si) => (
                <div key={si} className="space-y-4">
                  <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, di) => (
                      <div key={di} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))
            : visibleCategories.map((cat) => {
                const catDocs = grouped[cat];
                if (catDocs.length === 0) return null;
                const meta = DOC_CATEGORY_META[cat];
                return (
                  <motion.div
                    key={cat}
                    variants={fadeUpVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                        {CATEGORY_ICONS[cat]}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-primary-900">{meta.label}</h2>
                        <p className="text-xs text-slate-500">{catDocs.length}件</p>
                      </div>
                    </div>

                    <motion.div
                      variants={staggerContainerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      {catDocs.map((doc) => (
                        <DocCard key={doc.id} doc={doc} />
                      ))}
                    </motion.div>
                  </motion.div>
                );
              })}

          {!loading && docs.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">現在公開中の資料はありません。</p>
            </div>
          )}
        </div>
      </section>

      {/* Notice */}
      <section className="section-sm bg-slate-50 border-t border-slate-200">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 flex gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <div>
              <p className="font-medium mb-1">資料のご利用について</p>
              <p className="text-blue-700 leading-relaxed">
                掲載資料は当協会会員・施工関係者向けの技術参考資料です。無断複製・転載・二次配布はお断りしています。
                資料に関するお問い合わせは
                <Link href="/contact" className="underline ml-1 hover:text-blue-900">お問い合わせフォーム</Link>
                までご連絡ください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-accent-600">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto text-center md:text-left">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">資料に関するお問い合わせ</h2>
              <p className="text-accent-100 text-sm">最新版資料のご請求やご不明点はお気軽にご相談ください。</p>
            </div>
            <Button variant="white" asChild>
              <Link href="/contact">お問い合わせフォーム</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
