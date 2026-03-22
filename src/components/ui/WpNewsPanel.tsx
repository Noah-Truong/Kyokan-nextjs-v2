"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAnnotatedPosts,
  NEWS_CATEGORY_META,
  formatWpDate,
  WP_API_URL,
  stripHtml,
  type WpPost,
  type WpCategory,
} from "@/lib/wordpress";

const MOCK_POSTS: WpPost[] = [
  {
    id: 1,
    date: "2026-02-20T00:00:00",
    title: { rendered: "年末年始の営業について" },
    excerpt: { rendered: "<p>2026年12月28日〜2027年1月5日は休業いたします。</p>" },
    link: "#",
    slug: "year-end",
    categories: [],
    categorySlug: "info",
  },
  {
    id: 2,
    date: "2026-01-15T00:00:00",
    title: { rendered: "2026年版 施工マニュアルを公開しました" },
    excerpt: { rendered: "<p>最新の施工マニュアルをダウンロードページにアップロードしました。</p>" },
    link: "#",
    slug: "manual-2026",
    categories: [],
    categorySlug: "download",
  },
  {
    id: 3,
    date: "2025-12-05T00:00:00",
    title: { rendered: "インフラメンテナンス大賞 優秀賞を受賞しました" },
    excerpt: { rendered: "<p>国土交通大臣賞・インフラメンテナンス大賞の優秀賞を受賞いたしました。</p>" },
    link: "#",
    slug: "award-2025",
    categories: [],
    categorySlug: "award",
  },
  {
    id: 4,
    date: "2025-11-10T00:00:00",
    title: { rendered: "冬季施工に関するお知らせ" },
    excerpt: { rendered: "<p>寒冷地向けの施工対応について案内します。</p>" },
    link: "#",
    slug: "winter-notice",
    categories: [],
    categorySlug: "info",
  },
];

const CATEGORY_ICON: Record<WpCategory, React.ReactNode> = {
  info: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  download: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  ),
  award: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

function NewsModal({ post, onClose }: { post: WpPost; onClose: () => void }) {
  const meta = post.categorySlug ? NEWS_CATEGORY_META[post.categorySlug] : null;
  const icon = post.categorySlug ? CATEGORY_ICON[post.categorySlug] : null;
  const excerpt = stripHtml(post.excerpt.rendered);
  const isInternalLink = post.link.startsWith("/");
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function handleInternalLink() {
    onClose();
    router.push(post.link);
  }

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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Meta */}
          <div className="flex items-center gap-2 mb-3">
            <time className="text-xs text-slate-400 tabular-nums">{formatWpDate(post.date)}</time>
            {meta && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                {icon}
                {meta.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="text-base font-semibold text-primary-900 leading-snug mb-3"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Excerpt */}
          {excerpt && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{excerpt}</p>
          )}

          {/* CTA for document news items */}
          {isInternalLink && (
            <button
              onClick={handleInternalLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              ダウンロードページへ
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function WpNewsPanel() {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WpPost | null>(null);

  useEffect(() => {
    const isPlaceholder =
      !WP_API_URL ||
      WP_API_URL.includes("your-wordpress-site") ||
      WP_API_URL === "";

    if (isPlaceholder) {
      setPosts(MOCK_POSTS);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    fetchAnnotatedPosts(5)
      .then((data) => setPosts(data))
      .catch(() => {
        setPosts(MOCK_POSTS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {selectedPost && (
        <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full lg:max-w-sm xl:max-w-md"
      >
        <div className="bg-primary-950/70 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white tracking-wide">
                お知らせ・新着情報
              </h3>
            </div>
            {usingMock && (
              <span className="text-[10px] text-white/30 italic">preview</span>
            )}
          </div>

          {/* Post list */}
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 animate-pulse space-y-2">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-4 w-full rounded bg-white/10" />
                    </div>
                  ))
                : posts.map((post, i) => {
                    const meta = post.categorySlug
                      ? NEWS_CATEGORY_META[post.categorySlug]
                      : null;
                    const icon = post.categorySlug
                      ? CATEGORY_ICON[post.categorySlug]
                      : null;

                    return (
                      <motion.button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="w-full text-left flex flex-col gap-1.5 px-5 py-4 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <time className="text-[11px] text-white/40 tabular-nums">
                            {formatWpDate(post.date)}
                          </time>
                          {meta && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.badgeClass}`}
                            >
                              {icon}
                              {meta.label}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-sm text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                      </motion.button>
                    );
                  })}
            </AnimatePresence>
          </div>

          {/* Footer link */}
          <div className="px-5 py-3 border-t border-white/10 text-right">
            <a
              href="/news"
              className="text-xs text-accent-300 hover:text-accent-200 transition-colors inline-flex items-center gap-1"
            >
              すべて見る
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
