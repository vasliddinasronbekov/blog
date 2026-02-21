export const dynamic = "force-dynamic";

export async function GET() {
  const backendBase = process.env.NEXT_PUBLIC_API_URL || "https://api.zuuu.uz";
  const backendUrl = `${backendBase.replace(/\/$/, "")}/sitemap.xml`;

  const response = await fetch(backendUrl, { cache: "no-store" });

  if (!response.ok) {
    return new Response("Failed to load sitemap", { status: 502 });
  }

  const xml = await response.text();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
