"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchAnnotatedPosts,
  formatWpDate,
  isWpConfigured,
  NEWS_CATEGORY_META,
  MOCK_NEWS_POSTS,
  stripHtml,
  type WpPost,
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

export function NewsTicker() {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<WpPost | null>(null);

  useEffect(() => {
    if (!isWpConfigured()) {
      setPosts(MOCK_NEWS_POSTS.slice(0, 5));
      setLoading(false);
      return;
    }
    fetchAnnotatedPosts(5)
      .then(setPosts)
      .catch(() => setPosts(MOCK_NEWS_POSTS.slice(0, 5)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {selectedPost && (
        <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <div className="bg-white border-b border-slate-200">
        <div className="container-custom">
          <div className="py-3 space-y-0">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
                    <div className="h-3 w-20 rounded bg-slate-200 shrink-0" />
                    <div className="h-5 w-16 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-3 w-full max-w-xs rounded bg-slate-200" />
                  </div>
                ))
              : posts.map((post) => {
                  const meta = post.categorySlug
                    ? NEWS_CATEGORY_META[post.categorySlug]
                    : NEWS_CATEGORY_META.info;

                  return (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 group hover:bg-slate-50 -mx-4 px-4 rounded transition-colors"
                    >
                      <time className="text-xs text-slate-400 tabular-nums shrink-0 w-24">
                        {formatWpDate(post.date)}
                      </time>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span
                        className="text-sm text-slate-700 group-hover:text-accent-600 transition-colors line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                    </button>
                  );
                })}
          </div>

          {/* View all */}
          <div className="pb-3 flex justify-end">
            <Link
              href="/news"
              className="text-xs text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              すべてのニュースを見る
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
