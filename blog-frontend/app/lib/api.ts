// app/lib/api.ts

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.zuuu.uz'}/api`;

type ListResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

export type AdSenseConfig = {
  enabled: boolean;
  publisher_id?: string;
  homepage_ad_unit_id?: string;
  post_sidebar_ad_unit_id?: string;
  post_content_ad_unit_id?: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  author?: string;
  category?: number | null;
  category_name?: string;
  category_slug?: string;
  created_at: string;
  updated_at?: string;
  slug: string;
  featured_image?: string | null;
  featured_image_url?: string | null;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  is_indexable?: boolean;
  canonical_url?: string | null;
  comments?: PostComment[];
  tags?: number[];
  tag_names?: string[];
  tag_details?: Tag[];
};

export type PostComment = {
  id: number;
  author?: string;
  text: string;
  created_at: string;
};

function normalizeList<T>(data: ListResponse<T> | T[]): T[] {
  if (Array.isArray(data)) return data;
  return data.results || [];
}

async function fetchJson(url: string, init?: RequestInit, fallbackError = 'Request failed') {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`${fallbackError}: ${res.status}`);
  }
  return res.json();
}

export async function getAdSenseSettings(): Promise<AdSenseConfig | null> {
  try {
    const data = await fetchJson(
      `${API_BASE}/adsense-settings/`,
      { cache: 'no-store' },   // ✅ muhim
      'Failed to load AdSense settings'
    )
    return data
  } catch (error) {
    console.error('getAdSenseSettings error:', error)
    return null
  }
}

export async function getPosts(filters?: {
  category?: number;
  tags?: number;
  page?: number;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', String(filters.category));
  if (filters?.tags) params.set('tags', String(filters.tags));
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.search) params.set('search', filters.search);

  const url = params.toString()
    ? `${API_BASE}/posts/?${params.toString()}`
    : `${API_BASE}/posts/`;
  const data = await fetchJson(url, { next: { revalidate: 60 } }, 'Failed to load posts');
  return normalizeList<Post>(data);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${slug}/`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to load post');
    }

    return res.json();
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
}

export async function getRelatedPostsForPost(post: Post, limit = 6): Promise<Post[]> {
  let related: Post[] = [];

  if (post.tags && post.tags.length > 0) {
    related = await getPosts({ tags: post.tags[0] });
  }

  if (related.length === 0 && post.category) {
    related = await getPosts({ category: post.category });
  }

  return related.filter((item) => item.slug !== post.slug).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await fetchJson(
      `${API_BASE}/categories/`,
      { cache: 'force-cache' },
      'Failed to load categories'
    );
    return normalizeList<Category>(data);
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const data = await fetchJson(
      `${API_BASE}/categories/?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
      'Failed to load category'
    );
    const categories = normalizeList<Category>(data);
    return categories[0] || null;
  } catch (error) {
    console.error('getCategoryBySlug error:', error);
    return null;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const data = await fetchJson(
      `${API_BASE}/tags/`,
      { next: { revalidate: 300 } },
      'Failed to load tags'
    );
    return normalizeList<Tag>(data);
  } catch (error) {
    console.error('getTags error:', error);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const data = await fetchJson(
      `${API_BASE}/tags/?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
      'Failed to load tag'
    );
    const tags = normalizeList<Tag>(data);
    return tags[0] || null;
  } catch (error) {
    console.error('getTagBySlug error:', error);
    return null;
  }
}

export async function createPost(
  data: {
    title: string;
    content: string;
    category_id?: number;
    featured_image?: File | null;
  },
  token: string
) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);

  if (data.category_id) {
    formData.append('category', data.category_id.toString());
  }

  if (data.featured_image) {
    formData.append('featured_image', data.featured_image);
  }

  const res = await fetch(`${API_BASE}/posts/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to create post");
  }

  return res.json();
}

export async function addComment(postId: number, text: string, token: string) {
  const res = await fetch(`${API_BASE}/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ post: postId, text }),
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}
