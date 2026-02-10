// app/lib/api.ts

// Backend URL manzilini sozlash (prefiks /api/ bilan)
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.zuuu.uz:8000'}/api`;

/**
 * 1. Barcha postlarni olish
 * Django DRF Pagination (PageNumberPagination) bilan moslangan
 */
export async function getPosts() {
  try {
    const res = await fetch(`${API_BASE}/posts/`, {
      next: { revalidate: 60 }, // ISR: Har 1 minutda keshni yangilash
    });

    if (!res.ok) {
      throw new Error(`Xatolik: ${res.status} - Postlarni yuklab bo'lmadi`);
    }

    const data = await res.json();
    // Django Pagination ishlatsa natija .results ichida bo'ladi, aks holda massiv o'zi
    return data.results || data;
  } catch (error) {
    console.error("getPosts xatosi:", error);
    throw error;
  }
}

/**
 * 2. Bitta postni slug orqali olish
 */
export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/posts/${slug}/`, {
      next: { revalidate: 300 }, // Detal sahifasini har 5 minutda yangilash
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Postni yuklashda xatolik");
    }

    return res.json();
  } catch (error) {
    console.error("getPostBySlug xatosi:", error);
    return null;
  }
}

/**
 * 3. Yangi post yaratish
 * FormData orqali rasmlar va matnlarni yuborish
 */
export async function createPost(
  data: { 
    title: string; 
    content: string; 
    category_id?: number; 
    featured_image?: File | null 
  }, 
  token: string
) {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  
  if (data.category_id) {
    formData.append('category_id', data.category_id.toString());
  }
  
  if (data.featured_image) {
    formData.append('featured_image', data.featured_image);
  }

  const res = await fetch(`${API_BASE}/posts/`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`, // JWT Token
      // 'Content-Type' kerak emas, FormData uni avtomatik belgilaydi
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(JSON.stringify(errorData) || 'Post yaratib bo‘lmadi');
  }

  return res.json();
}

/**
 * 4. Barcha kategoriyalarni olish
 * Formada dropdown (tanlov) yaratish uchun kerak
 */
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories/`, {
      cache: 'force-cache', // Kategoriyalar kam o'zgargani uchun keshlaymiz
    });

    if (!res.ok) throw new Error("Kategoriyalar topilmadi");

    const data = await res.json();
    return data.results || data;
  } catch (error) {
    console.error("getCategories xatosi:", error);
    return [];
  }
}

/**
 * 5. Izoh qoldirish
 */
export async function addComment(postId: number, text: string, token: string) {
  const res = await fetch(`${API_BASE}/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ post: postId, text: text }),
  });

  if (!res.ok) throw new Error("Izoh qoldirib bo'lmadi");
  return res.json();
}
