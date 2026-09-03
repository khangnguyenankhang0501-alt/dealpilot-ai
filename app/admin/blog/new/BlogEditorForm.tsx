"use client";

import { useState, type ChangeEvent } from "react";
import * as mammoth from "mammoth";

type BlogEditorFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export default function BlogEditorForm({ action }: BlogEditorFormProps) {
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleWordImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !file.name.toLowerCase().endsWith(".docx")
    ) {
      window.alert("Please choose a .docx Word file.");
      event.target.value = "";
      return;
    }

    setImporting(true);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.extractRawText({
        arrayBuffer,
      });

      setContent(result.value);

      if (result.messages.length > 0) {
        console.warn("Word import messages:", result.messages);
      }
    } catch (error) {
      console.error("Word import error:", error);

      window.alert("Could not import this Word document.");

      setFileName("");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  return (
    <form action={action} encType="multipart/form-data" className="space-y-6">
      {/* ARTICLE INFORMATION */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">
            Article Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the basic information for your article.
          </p>
        </div>

        <div className="grid gap-5">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Title *
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Best Nike Promo Codes September 2026"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Slug
            </label>

            <input
              id="slug"
              name="slug"
              type="text"
              placeholder="Leave blank to generate automatically"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Example: best-nike-promo-codes-september-2026
            </p>
          </div>

          <div>
            <label
              htmlFor="excerpt"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Excerpt
            </label>

            <textarea
              id="excerpt"
              name="excerpt"
              rows={4}
              placeholder="Write a short summary of the article..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Category
              </label>

              <input
                id="category"
                name="category"
                type="text"
                placeholder="Coupons"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="store_slug"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Store Slug
              </label>

              <input
                id="store_slug"
                name="store_slug"
                type="text"
                placeholder="Nike"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Example: Nike, Walmart, Target
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORT WORD */}

      <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-7">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-900">
            Import from Word
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Choose a Word document (.docx) and its text will be placed into the
            Article Content box automatically.
          </p>
        </div>

        <label
          htmlFor="word-import"
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white px-6 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50"
        >
          <span className="text-4xl">📄</span>

          <span className="mt-3 text-sm font-black text-slate-800">
            {importing ? "Importing Word document..." : "Choose Word document"}
          </span>

          <span className="mt-1 text-xs text-slate-500">.docx files only</span>

          <input
            id="word-import"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleWordImport}
            disabled={importing}
            className="sr-only"
          />
        </label>

        {fileName && !importing && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm">
            <span className="font-bold text-slate-700">Imported:</span>{" "}
            <span className="text-slate-600">{fileName}</span>
          </div>
        )}
      </section>

      {/* FEATURED IMAGE */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">Featured Image</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Choose an image from your computer. Maximum size is 5MB.
          </p>
        </div>

        <label
          htmlFor="image"
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          <span className="text-4xl">🖼️</span>

          <span className="mt-3 text-sm font-black text-slate-800">
            Choose an image
          </span>

          <span className="mt-1 text-xs text-slate-500">
            JPG, PNG, WEBP or GIF
          </span>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
          />
        </label>
      </section>

      {/* ARTICLE CONTENT */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">Article Content</h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Write normally or import your article from Word.
          </p>
        </div>

        <label
          htmlFor="content"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Article *
        </label>

        <textarea
          id="content"
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={24}
          placeholder="Write your article here..."
          className="min-h-[520px] w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          You can edit the imported Word text before publishing.
        </div>
      </section>

      {/* PUBLISH */}

      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Ready to publish?
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              The article and featured image will be saved to the DealPilot
              blog.
            </p>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.20)] transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🚀 Publish Post
          </button>
        </div>
      </section>
    </form>
  );
}
