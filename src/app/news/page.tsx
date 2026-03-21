"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/animations";
import {
  fetchPaginatedPosts,
  isWpConfigured,
  NEWS_CATEGORY_META,
  MOCK_NEWS_POSTS,
  formatWpDate,
  stripHtml,
  type WpPost,
  type WpCategory,
} from "@/lib/wordpress";

function NewsModal({ post, onClose }: { post: WpPost; onClose: () => void }) {
  const meta = post.categorySlug ? NEWS_CATEGORY_META[post.categorySlug] : NEWS_CATEGORY_META.info;
  const excerpt = stripHtml(post.excerpt.rendered);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-3">
            <time className="text-xs text-slate-400 tabular-nums">{formatWpDate(post.date)}</time>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.badgeClass}`}>
              {meta.label}
            </span>
          </div>

          <h2
            className="text-lg font-semibold text-primary-900 leading-snug mb-4"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {excerpt && (
            <p className="text-sm text-slate-600 leading-relaxed">{excerpt}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const CATEGORIES: { id: WpCategory | "all"; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "info", label: "お知らせ" },
  { id: "download", label: "資料追加" },
  { id: "award", label: "受賞報告" },
];

const PER_PAGE = 10;

function buildMockPaginated(category: WpCategory | "all", page: number) {
  // Expand mock data to simulate pagination
  const expanded: WpPost[] = [];
  for (let i = 0; i < 3; i++) {
    MOCK_NEWS_POSTS.forEach((p) =>
      expanded.push({ ...p, id: p.id + i * 100, date: new Date(new Date(p.date).getTime() - i * 30 * 86400000).toISOString() })
    );
  }
  const filtered =
    category === "all" ? expanded : expanded.filter((p) => p.categorySlug === category);
  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const posts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return { posts, total, totalPages };
}

export default function NewsPage() {
  const [category, setCategory] = useState<WpCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<WpPost | null>(null);

  const load = useCallback(async (cat: WpCategory | "all", pg: number) => {
    setLoading(true);
    try {
      if (!isWpConfigured()) {
        const result = buildMockPaginated(cat, pg);
        setPosts(result.posts);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } else {
        const result = await fetchPaginatedPosts(pg, PER_PAGE, cat === "all" ? undefined : cat);
        setPosts(result.posts);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      }
    } catch {
      const result = buildMockPaginated(cat, pg);
      setPosts(result.posts);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(category, page);
  }, [category, page, load]);

  function handleCategory(cat: WpCategory | "all") {
    setCategory(cat);
    setPage(1);
  }

  return (
    <div>
      {selectedPost && (
        <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

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
            <span className="section-label text-accent-400">News</span>
            <h1 className="text-display-md md:text-display-lg font-semibold text-white mb-4">
              お知らせ・新着情報
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              協会からの最新情報・資料更新・受賞のお知らせ
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-5 bg-slate-50 border-b border-slate-200 sticky top-16 z-20">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const meta = cat.id !== "all" ? NEWS_CATEGORY_META[cat.id] : null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategory(cat.id)}
                    className={`px-4 py-3 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${
                      category === cat.id
                        ? "bg-accent-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {meta && category !== cat.id && (
                      <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                    )}
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {!loading && (
              <p className="text-sm text-slate-500">{total}件</p>
            )}
          </div>
        </div>
      </section>

      {/* Post list */}
      <section className="section">
        <div className="container-custom max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0 divide-y divide-slate-100"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-5 animate-pulse">
                    <div className="h-3 w-20 rounded bg-slate-200 shrink-0" />
                    <div className="h-5 w-16 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-3 flex-1 max-w-sm rounded bg-slate-200" />
                  </div>
                ))}
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 text-slate-400"
              >
                <p className="text-sm">該当するお知らせはありません。</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${category}-${page}`}
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100"
              >
                {posts.map((post) => {
                  const meta = post.categorySlug
                    ? NEWS_CATEGORY_META[post.categorySlug]
                    : NEWS_CATEGORY_META.info;

                  return (
                    <motion.button
                      key={post.id}
                      variants={staggerItemVariants}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 py-5 group hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <time className="text-xs text-slate-400 tabular-nums shrink-0 sm:w-24">
                        {formatWpDate(post.date)}
                      </time>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 sm:w-20 justify-center ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span
                        className="text-sm text-primary-900 group-hover:text-accent-600 transition-colors leading-snug"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      <svg
                        className="w-4 h-4 text-slate-300 group-hover:text-accent-400 transition-colors ml-auto shrink-0 hidden sm:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="w-11 h-11 flex items-center justify-center text-slate-400 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-11 h-11 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === item
                          ? "bg-accent-600 text-white"
                          : "border border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-11 h-11 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-accent-600">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto text-center md:text-left">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">資料のダウンロード</h2>
              <p className="text-accent-100 text-sm">カタログ・施工マニュアルなどの資料はこちらからダウンロードできます。</p>
            </div>
            <Link
              href="/downloads"
              className="px-6 py-3 bg-white text-accent-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            >
              資料ダウンロードへ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
