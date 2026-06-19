"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, ImagePlus, Loader2, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import type { AdminBlogPost, AdminData } from "../types";
import {
  AdminField,
  csvToArray,
  FormGroup,
  Panel,
  TextAreaField,
  uploadToCloudinary,
  useToast,
} from "../shared";

export function Blog({ data }: { data: AdminData }) {
  const router = useRouter();
  const toast = useToast();
  const [modal, setModal] = useState<"create" | AdminBlogPost | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(p: AdminBlogPost) {
    if (!confirm(`Delete “${p.title}”?`)) return;
    setBusy(p.id);
    const res = await fetch(`/api/admin/blog/${p.id}`, { method: "DELETE" });
    if (res.ok) toast("Post deleted");
    else toast("Delete failed.", "error");
    setBusy(null);
    router.refresh();
  }

  async function togglePublish(p: AdminBlogPost) {
    setBusy(p.id);
    const res = await fetch(`/api/admin/blog/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    if (res.ok) toast(p.published ? "Unpublished" : "Published");
    else toast("Update failed.", "error");
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          Blog <span className="text-base text-muted">({data.blog.length})</span>
        </h1>
        <button
          onClick={() => setModal("create")}
          className="h-10 rounded-full bg-gradient-to-b from-gold-bright to-gold px-5 text-sm font-medium text-ink"
        >
          + New Post
        </button>
      </div>

      <Panel className="!p-0 overflow-hidden">
        {data.blog.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No posts yet.</p>
        ) : (
          <div className="divide-y divide-[color:var(--color-hairline)]">
            {data.blog.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-[var(--hover-soft)]">
                <div
                  className="hidden h-12 w-16 shrink-0 rounded-lg border border-hairline bg-cover bg-center sm:block"
                  style={p.coverImage ? { backgroundImage: `url("${p.coverImage}")` } : { background: "var(--surface-elevated)" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{p.title}</p>
                  <p className="truncate text-xs text-muted">
                    {p.author} · {p.date}
                  </p>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] uppercase tracking-widest sm:inline ${
                    p.published
                      ? "border-emerald/40 text-emerald"
                      : "border-hairline text-muted"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
                <button
                  onClick={() => togglePublish(p)}
                  disabled={busy === p.id}
                  className="hidden rounded-full border border-hairline px-3 py-1.5 text-xs text-parchment transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60 md:block"
                >
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/blog/${p.slug}`}
                  target="_blank"
                  aria-label="View post"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
                >
                  <ExternalLink size={15} />
                </Link>
                <button
                  onClick={() => setModal(p)}
                  aria-label={`Edit ${p.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-gold"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => remove(p)}
                  disabled={busy === p.id}
                  aria-label={`Delete ${p.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-2 transition-colors hover:text-burgundy"
                >
                  {busy === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {modal && (
        <BlogModal
          editing={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function BlogModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: AdminBlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState(() => ({
    title: editing?.title ?? "",
    author: editing?.author ?? "BottleExpress",
    excerpt: editing?.excerpt ?? "",
    content: editing?.content ?? "",
    tags: editing?.tags.join(", ") ?? "",
  }));
  const [cover, setCover] = useState<string | null>(editing?.coverImage ?? null);
  const [published, setPublished] = useState(editing?.published ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file);
      setCover(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      title: f.title,
      author: f.author || undefined,
      excerpt: f.excerpt || undefined,
      content: f.content,
      coverImage: cover,
      tags: csvToArray(f.tags),
      published,
    };
    const res = await fetch(
      editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (res.ok) {
      toast(editing ? "Post updated" : "Post published");
      onSaved();
    } else {
      const d = await res.json().catch(() => ({}));
      const issues = d.issues as Record<string, string[]> | undefined;
      setError(
        (issues && Object.values(issues).flat().find(Boolean)) ||
          d.error ||
          "Could not save the post."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-[var(--scrim)] backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="glass-dark relative z-10 my-6 w-full max-w-2xl rounded-[var(--radius-luxe)] p-6 md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">
            {editing ? "Edit Post" : "New Post"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} className="text-parchment hover:text-cream" />
          </button>
        </div>

        <div className="space-y-6">
          <FormGroup title="Post">
            <AdminField label="Title" value={f.title} onChange={(v) => set("title", v)} placeholder="How to build a home bar" required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminField label="Author" value={f.author} onChange={(v) => set("author", v)} placeholder="BottleExpress" />
              <AdminField label="Tags (comma separated)" value={f.tags} onChange={(v) => set("tags", v)} placeholder="guides, wine" />
            </div>
            <TextAreaField label="Excerpt" value={f.excerpt} onChange={(v) => set("excerpt", v)} placeholder="A short summary shown on the blog list…" />
          </FormGroup>

          <FormGroup title="Cover image">
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-28 shrink-0 rounded-xl border border-hairline bg-cover bg-center"
                style={cover ? { backgroundImage: `url("${cover}")` } : { background: "var(--surface-elevated)" }}
              />
              <div className="flex flex-col gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline px-4 py-2 text-xs text-parchment transition-colors hover:border-gold/40 hover:text-gold ${
                    uploading ? "opacity-60" : ""
                  }`}
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                  {uploading ? "Uploading…" : cover ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={onFile} disabled={uploading} className="hidden" />
                </label>
                {cover && (
                  <button
                    type="button"
                    onClick={() => setCover(null)}
                    className="text-left text-xs text-muted hover:text-burgundy"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </FormGroup>

          <FormGroup title="Content">
            <label className="block">
              <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
                Body — supports “## heading”, “- bullet”, and blank-line paragraphs
              </span>
              <textarea
                value={f.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={"Write your post here…\n\n## A heading\n\n- A point\n- Another point"}
                rows={12}
                required
                className="w-full rounded-xl border border-hairline bg-night/60 px-4 py-3 font-mono text-[0.82rem] leading-relaxed text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
              />
            </label>
          </FormGroup>

          <label className="flex items-center gap-2 text-sm text-parchment">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            Published (visible on the public blog)
          </label>
        </div>

        {error && <p className="mt-5 text-xs text-burgundy">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-full border border-hairline text-sm text-parchment hover:text-cream"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-medium text-ink disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {editing ? "Save Changes" : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
