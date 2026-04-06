"use client";
import { useState } from "react";

export default function CreateAIPostPage() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/admin/blog/post/ai-generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords, tone, sync: true }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">AI Post Generator</h1>
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block font-medium">Topic *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Keywords</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="Comma separated"
          />
        </div>
        <div>
          <label className="block font-medium">Tone</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={tone}
            onChange={e => setTone(e.target.value)}
            placeholder="e.g. expert, friendly, academic"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-8 border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Generated Post</h2>
          <div className="mb-2"><b>Title:</b> {result.title}</div>
          <div className="mb-2"><b>SEO Title:</b> {result.seo_title}</div>
          <div className="mb-2"><b>SEO Description:</b> {result.seo_description}</div>
          <div className="mb-2"><b>SEO Keywords:</b> {result.seo_keywords}</div>
          <div className="mb-2"><b>Tags:</b> {Array.isArray(result.tags) ? result.tags.join(", ") : ""}</div>
          <div className="mb-2"><b>Content:</b></div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: result.content }} />
        </div>
      )}
    </div>
  );
}
