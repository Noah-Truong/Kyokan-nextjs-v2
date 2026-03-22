// ─── Config ──────────────────────────────────────────────────────────────────

export const WP_API_URL =
  (process.env.NEXT_PUBLIC_WP_API_URL ?? "https://your-wordpress-site.com").replace(
    /\/+$/,
    ""
  );

export function isWpConfigured(): boolean {
  return Boolean(WP_API_URL && !WP_API_URL.includes("your-wordpress-site"));
}

// ─── News / Post types ────────────────────────────────────────────────────────

export type WpCategory = "info" | "download" | "award";

export interface WpPost {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  slug: string;
  categories: number[];
  categorySlug?: WpCategory;
}

export interface WpTerm {
  id: number;
  slug: string;
  name: string;
}

export interface PaginatedPosts {
  posts: WpPost[];
  totalPages: number;
  total: number;
}

// ─── Document / Download types ────────────────────────────────────────────────

export type DocCategory =
  | "catalog"
  | "technical-spec"
  | "construction-manual"
  | "design-reference";

export interface WpDocument {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  acf: {
    short_description?: string;
    file_url?: string;
    file_size?: string;
    document_category?: DocCategory;
  };
  slug: string;
  link: string;
  /** Resolved from ACF or taxonomy */
  docCategory?: DocCategory;
}

// ─── Category metadata ────────────────────────────────────────────────────────

export const NEWS_CATEGORY_META: Record<
  WpCategory,
  { label: string; badgeClass: string; dotClass: string }
> = {
  info: {
    label: "お知らせ",
    badgeClass: "bg-slate-200 text-slate-700",
    dotClass: "bg-slate-400",
  },
  download: {
    label: "資料追加",
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  award: {
    label: "受賞報告",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
};

export const DOC_CATEGORY_META: Record<
  DocCategory,
  { label: string; icon: string; color: string }
> = {
  catalog: {
    label: "カタログ",
    icon: "book",
    color: "text-blue-600 bg-blue-50",
  },
  "technical-spec": {
    label: "技術仕様書",
    icon: "settings",
    color: "text-violet-600 bg-violet-50",
  },
  "construction-manual": {
    label: "施工マニュアル",
    icon: "tool",
    color: "text-emerald-600 bg-emerald-50",
  },
  "design-reference": {
    label: "設計参考図",
    icon: "layout",
    color: "text-orange-600 bg-orange-50",
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatWpDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// ─── Category mapping helper ──────────────────────────────────────────────────

async function buildCategoryMap(): Promise<Map<number, string>> {
  const url = `${WP_API_URL}/wp-json/wp/v2/categories?per_page=100&_fields=id,slug`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return new Map();
  const cats: WpTerm[] = await res.json();
  return new Map(cats.map((c) => [c.id, c.slug]));
}

// ─── Document → news post conversion ─────────────────────────────────────────
// Converts a document CPT entry into a WpPost so it appears in news feeds.
// IDs are offset by 900000 to avoid collisions with regular post IDs.

function documentToNewsPost(doc: WpDocument): WpPost {
  const desc =
    doc.acf?.short_description ||
    doc.excerpt?.rendered?.replace(/<[^>]*>/g, "").trim() ||
    "";
  // Link to the downloads page scrolled to the document's category section
  const anchor = doc.acf?.document_category ? `#${doc.acf.document_category}` : "";
  return {
    id: doc.id + 900000,
    date: doc.date,
    title: doc.title,
    excerpt: { rendered: desc },
    link: `/downloads${anchor}`,
    slug: doc.slug,
    categories: [],
    categorySlug: "download",
  };
}

async function fetchDocumentsAsNewsPosts(): Promise<WpPost[]> {
  const url = `${WP_API_URL}/wp-json/wp/v2/document?per_page=100&_fields=id,date,title,excerpt,acf,slug,link`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const docs: WpDocument[] = await res.json();
  return docs.map(documentToNewsPost);
}

function sortByDateDesc(posts: WpPost[]): WpPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// ─── News post fetching ───────────────────────────────────────────────────────

export async function fetchAnnotatedPosts(perPage = 5): Promise<WpPost[]> {
  const [postsRes, docPosts] = await Promise.all([
    fetch(
      `${WP_API_URL}/wp-json/wp/v2/posts?per_page=100&_fields=id,date,title,excerpt,link,slug,categories`,
      { next: { revalidate: 300 } }
    ),
    fetchDocumentsAsNewsPosts(),
  ]);

  if (!postsRes.ok) throw new Error(`WP posts fetch failed: ${postsRes.status}`);
  const posts: WpPost[] = await postsRes.json();
  const catMap = await buildCategoryMap();
  const validSlugs = new Set<string>(["info", "download", "award"]);

  const annotated = posts.map((p) => {
    const matched = p.categories
      .map((id) => catMap.get(id))
      .find((s) => s && validSlugs.has(s));
    return { ...p, categorySlug: matched as WpCategory | undefined };
  });

  return sortByDateDesc([...annotated, ...docPosts]).slice(0, perPage);
}

export async function fetchPaginatedPosts(
  page = 1,
  perPage = 10,
  categorySlug?: string
): Promise<PaginatedPosts> {
  const includeDocuments = !categorySlug || categorySlug === "all" || categorySlug === "download";

  // Resolve category ID for post filtering
  let catId = "";
  if (categorySlug && categorySlug !== "all" && categorySlug !== "download") {
    const catRes = await fetch(
      `${WP_API_URL}/wp-json/wp/v2/categories?slug=${categorySlug}&_fields=id`,
      { next: { revalidate: 3600 } }
    );
    if (catRes.ok) {
      const cats = await catRes.json();
      if (cats.length > 0) catId = cats[0].id;
    }
  }

  // When merging with documents, fetch all posts so we can sort and paginate manually
  const fetchPerPage = includeDocuments ? 100 : perPage;
  const fetchPage = includeDocuments ? 1 : page;

  const params = new URLSearchParams({
    per_page: String(fetchPerPage),
    page: String(fetchPage),
    _fields: "id,date,title,excerpt,link,slug,categories",
  });
  if (catId) params.set("categories", catId);
  // When "download" category selected, also filter posts to that category
  if (categorySlug === "download" && !catId) {
    const dlCatRes = await fetch(
      `${WP_API_URL}/wp-json/wp/v2/categories?slug=download&_fields=id`,
      { next: { revalidate: 3600 } }
    );
    if (dlCatRes.ok) {
      const dlCats = await dlCatRes.json();
      if (dlCats.length > 0) params.set("categories", dlCats[0].id);
    }
  }

  const [postsRes, docPosts] = await Promise.all([
    fetch(`${WP_API_URL}/wp-json/wp/v2/posts?${params}`, {
      next: { revalidate: 300 },
    }),
    includeDocuments ? fetchDocumentsAsNewsPosts() : Promise.resolve([]),
  ]);

  if (!postsRes.ok) throw new Error(`WP posts fetch failed: ${postsRes.status}`);

  const posts: WpPost[] = await postsRes.json();
  const catMap = await buildCategoryMap();
  const validSlugs = new Set<string>(["info", "download", "award"]);

  const annotated = posts.map((p) => {
    const matched = p.categories
      .map((id) => catMap.get(id))
      .find((s) => s && validSlugs.has(s));
    return { ...p, categorySlug: matched as WpCategory | undefined };
  });

  if (!includeDocuments) {
    const totalPages = Number(postsRes.headers.get("X-WP-TotalPages") ?? 1);
    const total = Number(postsRes.headers.get("X-WP-Total") ?? posts.length);
    return { posts: annotated, totalPages, total };
  }

  // Merge posts + documents, sort by date, paginate manually
  const merged = sortByDateDesc([...annotated, ...docPosts]);
  const total = merged.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = merged.slice((page - 1) * perPage, page * perPage);

  return { posts: paginated, totalPages, total };
}

// ─── Document fetching ────────────────────────────────────────────────────────

export async function fetchDocuments(): Promise<WpDocument[]> {
  const url = `${WP_API_URL}/wp-json/wp/v2/document?per_page=100&_fields=id,date,title,excerpt,acf,slug,link`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`WP documents fetch failed: ${res.status}`);
  const docs: WpDocument[] = await res.json();
  return docs.map((d) => ({
    ...d,
    docCategory: d.acf?.document_category,
  }));
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_NEWS_POSTS: WpPost[] = [
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
    link: "/downloads",
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
    excerpt: { rendered: "" },
    link: "#",
    slug: "winter-notice",
    categories: [],
    categorySlug: "info",
  },
  {
    id: 5,
    date: "2025-10-01T00:00:00",
    title: { rendered: "技術仕様書（改訂版）を公開しました" },
    excerpt: { rendered: "" },
    link: "/downloads",
    slug: "spec-rev",
    categories: [],
    categorySlug: "download",
  },
];

export const MOCK_DOCUMENTS: WpDocument[] = [
  // Catalogs
  {
    id: 10,
    date: "2026-01-01T00:00:00",
    title: { rendered: "RAKUYU-Z工法 総合カタログ 2026年版" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "工法の概要・仕様・施工事例をまとめた総合カタログです。",
      file_url: "#",
      file_size: "8.4 MB",
      document_category: "catalog",
    },
    slug: "catalog-2026",
    link: "#",
    docCategory: "catalog",
  },
  {
    id: 11,
    date: "2025-06-01T00:00:00",
    title: { rendered: "特殊ポンプ 製品カタログ" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "各種特殊ポンプの仕様・寸法・性能曲線を掲載しています。",
      file_url: "#",
      file_size: "3.2 MB",
      document_category: "catalog",
    },
    slug: "pump-catalog",
    link: "#",
    docCategory: "catalog",
  },
  // Technical Specs
  {
    id: 20,
    date: "2026-01-15T00:00:00",
    title: { rendered: "RAKUYU-Z工法 技術仕様書（改訂第4版）" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "工法の設計・施工に必要な技術的仕様を詳細に記載した公式仕様書です。",
      file_url: "#",
      file_size: "5.1 MB",
      document_category: "technical-spec",
    },
    slug: "tech-spec-v4",
    link: "#",
    docCategory: "technical-spec",
  },
  {
    id: 21,
    date: "2024-09-01T00:00:00",
    title: { rendered: "通水プラグ・ストッパー 技術基準" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "通水プラグ及びストッパーの材質・耐圧・適用条件に関する技術基準です。",
      file_url: "#",
      file_size: "2.8 MB",
      document_category: "technical-spec",
    },
    slug: "plug-stopper-spec",
    link: "#",
    docCategory: "technical-spec",
  },
  // Construction Manuals
  {
    id: 30,
    date: "2026-01-15T00:00:00",
    title: { rendered: "RAKUYU-Z工法 施工マニュアル 2026年版" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "現場での施工手順・安全管理・品質管理を網羅した最新マニュアルです。",
      file_url: "#",
      file_size: "12.7 MB",
      document_category: "construction-manual",
    },
    slug: "manual-2026",
    link: "#",
    docCategory: "construction-manual",
  },
  {
    id: 31,
    date: "2024-03-01T00:00:00",
    title: { rendered: "不断水作業 安全管理マニュアル" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "不断水施工における作業員安全管理・緊急対応手順をまとめたマニュアルです。",
      file_url: "#",
      file_size: "4.3 MB",
      document_category: "construction-manual",
    },
    slug: "safety-manual",
    link: "#",
    docCategory: "construction-manual",
  },
  // Design Reference
  {
    id: 40,
    date: "2025-08-01T00:00:00",
    title: { rendered: "標準施工図集（管径 φ150〜φ700）" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "φ150〜φ700対応の標準施工図・断面図・平面図セットです。",
      file_url: "#",
      file_size: "18.2 MB",
      document_category: "design-reference",
    },
    slug: "std-drawings",
    link: "#",
    docCategory: "design-reference",
  },
  {
    id: 41,
    date: "2024-11-01T00:00:00",
    title: { rendered: "大口径対応 設計参考図（φ800〜φ1800）" },
    excerpt: { rendered: "" },
    acf: {
      short_description: "大口径管（φ800以上）への対応設計図面集です。ストッパー設置詳細を含みます。",
      file_url: "#",
      file_size: "22.5 MB",
      document_category: "design-reference",
    },
    slug: "large-dia-drawings",
    link: "#",
    docCategory: "design-reference",
  },
];
