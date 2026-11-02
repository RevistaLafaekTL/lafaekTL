"use client";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import type { LearningCategorySlug, LearningItemRecord } from "@/lib/learning-types";

const CATEGORY_OPTIONS: Array<{ value: LearningCategorySlug; label: string }> = [
  { value: "stories", label: "Stories" },
  { value: "natural-science", label: "Natural Science" },
  { value: "social-science", label: "Social Science" },
  { value: "physical-education", label: "Physical Education" },
  { value: "literacy", label: "Literacy" },
  { value: "mathematics", label: "Mathematics" },
  { value: "health", label: "Health" },
  { value: "games", label: "Games" },
  { value: "creativity", label: "Creativity" },
];

type LearningFormState = {
  itemId: string;
  categorySlug: LearningCategorySlug | "";
  titleEn: string;
  titleTet: string;
  descriptionEn: string;
  descriptionTet: string;
  sourcePdfUrl: string;
  isPublished: boolean;
};

type UploadState = {
  isUploadingCover: boolean;
  isUploadingPages: boolean;
  isUploadingPdf: boolean;
};

type LearningApiListResponse = {
  success: boolean;
  items?: LearningItemRecord[];
  item?: LearningItemRecord;
  message?: string;
};

type PresignResponse = {
  url: string;
  fields: Record<string, string>;
  publicUrl: string;
  key: string;
  error?: string;
};

const initialForm: LearningFormState = {
  itemId: "",
  categorySlug: "",
  titleEn: "",
  titleTet: "",
  descriptionEn: "",
  descriptionTet: "",
  sourcePdfUrl: "",
  isPublished: false,
};

async function getPresign(file: File, folder: string) {
  const response = await fetch("/api/uploads/s3/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    }),
  });

  const data = (await response.json()) as PresignResponse;

  if (!response.ok || data.error) {
    throw new Error(data.error || "Failed to create upload link.");
  }

  return data;
}

async function uploadFileToS3(file: File, folder: string) {
  const presign = await getPresign(file, folder);

  const formData = new FormData();

  Object.entries(presign.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append("file", file);

  const uploadResponse = await fetch(presign.url, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const uploadText = await uploadResponse.text().catch(() => "");
    throw new Error(uploadText || `Upload failed for ${file.name}`);
  }

  return {
    publicUrl: presign.publicUrl,
    key: presign.key,
  };
}

export default function AdminLearningPage() {
  const [form, setForm] = useState<LearningFormState>(initialForm);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [pageImageUrls, setPageImageUrls] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [editingItemId, setEditingItemId] = useState("");

  const [items, setItems] = useState<LearningItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState("");

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploadingCover: false,
    isUploadingPages: false,
    isUploadingPdf: false,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // ── Filters for the Saved Learning Items list ──────────────────────────────
  const [showFilters, setShowFilters] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<LearningCategorySlug | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [onlyWithPdf, setOnlyWithPdf] = useState(false);
  const [sortMode, setSortMode] = useState<"updated" | "title" | "category">("updated");

  const isBusy = useMemo(() => {
    return (
      isSaving ||
      uploadState.isUploadingCover ||
      uploadState.isUploadingPages ||
      uploadState.isUploadingPdf
    );
  }, [isSaving, uploadState]);

  const isEditing = editingItemId.length > 0;

  const totalPublished = useMemo(() => {
    return items.filter((item) => item.isPublished).length;
  }, [items]);

  const totalWithPdf = useMemo(() => {
    return items.filter((item) => !!item.sourcePdfUrl).length;
  }, [items]);

  const totalPages = useMemo(() => {
    return items.reduce((sum, item) => sum + item.pageImageUrls.length, 0);
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = [...items];

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const fields = [
          item.itemId,
          item.titleEn,
          item.titleTet,
          item.descriptionEn,
          item.descriptionTet,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        return fields.some((value) => value.includes(q));
      });
    }

    if (categoryFilter !== "all") {
      list = list.filter((item) => item.categorySlug === categoryFilter);
    }

    if (statusFilter === "published") {
      list = list.filter((item) => item.isPublished);
    } else if (statusFilter === "draft") {
      list = list.filter((item) => !item.isPublished);
    }

    if (onlyWithPdf) {
      list = list.filter((item) => !!item.sourcePdfUrl);
    }

    const titleOf = (item: LearningItemRecord) =>
      String(item.titleTet || item.titleEn || "").toLowerCase();
    const updatedOf = (item: LearningItemRecord) =>
      item.updatedAt ? new Date(item.updatedAt).getTime() : 0;

    list.sort((a, b) => {
      if (sortMode === "title") {
        return titleOf(a).localeCompare(titleOf(b));
      }
      if (sortMode === "category") {
        const byCategory = String(a.categorySlug).localeCompare(String(b.categorySlug));
        return byCategory !== 0 ? byCategory : titleOf(a).localeCompare(titleOf(b));
      }
      return updatedOf(b) - updatedOf(a);
    });

    return list;
  }, [items, query, categoryFilter, statusFilter, onlyWithPdf, sortMode]);

  const hasActiveFilters =
    !!query.trim() || categoryFilter !== "all" || statusFilter !== "all" || onlyWithPdf;

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setOnlyWithPdf(false);
    setSortMode("updated");
  };

  const markChanged = () => {
    setHasChanges(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setCoverImageUrl("");
    setPageImageUrls([]);
    setPdfUrl("");
    setEditingItemId("");
    setHasChanges(false);
  };

  const handleChange = (field: keyof LearningFormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    markChanged();
  };

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/learning", {
        cache: "no-store",
      });

      const data = (await response.json()) as LearningApiListResponse;

      if (!response.ok || !data.success || !Array.isArray(data.items)) {
        throw new Error(data.message || "Failed to load learning items.");
      }

      const sorted = [...data.items].sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });

      setItems(sorted);
    } catch (err) {
      const nextMessage =
        err instanceof Error ? err.message : "Failed to load learning items.";
      setError(nextMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!hasChanges) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      const isModifiedClick =
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

      if (isModifiedClick || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const confirmed = window.confirm("You have unsaved changes. Leave this page and lose them?");
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasChanges]);

  const handleEdit = (item: LearningItemRecord) => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes in the current form. Switch items and lose them?"
      );
      if (!confirmed) {
        return;
      }
    }

    setError("");
    setMessage("");
    setEditingItemId(item.itemId);

    setForm({
      itemId: item.itemId,
      categorySlug: item.categorySlug,
      titleEn: item.titleEn,
      titleTet: item.titleTet,
      descriptionEn: item.descriptionEn,
      descriptionTet: item.descriptionTet,
      sourcePdfUrl: item.sourcePdfUrl || "",
      isPublished: item.isPublished,
    });

    setCoverImageUrl(item.coverImageUrl || "");
    setPageImageUrls(Array.isArray(item.pageImageUrls) ? item.pageImageUrls : []);
    setPdfUrl(item.sourcePdfUrl || "");
    setHasChanges(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      const confirmed = window.confirm("Discard unsaved changes in this form?");
      if (!confirmed) {
        return;
      }
    }

    setError("");
    setMessage("");
    resetForm();
  };

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploadState((prev) => ({ ...prev, isUploadingCover: true }));

    try {
      const result = await uploadFileToS3(file, "learning/covers");
      setCoverImageUrl(result.publicUrl);
      markChanged();
      setMessage("Cover uploaded successfully. Click Save Changes to keep it.");
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Failed to upload cover.";
      setError(nextMessage);
    } finally {
      setUploadState((prev) => ({ ...prev, isUploadingCover: false }));
      event.target.value = "";
    }
  };

  const handlePagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError("");
    setMessage("");
    setUploadState((prev) => ({ ...prev, isUploadingPages: true }));

    try {
      const uploaded: string[] = [];

      for (const file of files) {
        const result = await uploadFileToS3(file, "learning/pages");
        uploaded.push(result.publicUrl);
      }

      setPageImageUrls((prev) => [...prev, ...uploaded]);
      markChanged();
      setMessage(
        `${uploaded.length} page image${uploaded.length === 1 ? "" : "s"} uploaded successfully. Click Save Changes to keep them.`
      );
    } catch (err) {
      const nextMessage =
        err instanceof Error ? err.message : "Failed to upload page images.";
      setError(nextMessage);
    } finally {
      setUploadState((prev) => ({ ...prev, isUploadingPages: false }));
      event.target.value = "";
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    setUploadState((prev) => ({ ...prev, isUploadingPdf: true }));

    try {
      const result = await uploadFileToS3(file, "learning/pdfs");
      setPdfUrl(result.publicUrl);
      setForm((prev) => ({
        ...prev,
        sourcePdfUrl: result.publicUrl,
      }));
      markChanged();
      setMessage("PDF uploaded successfully. Click Save Changes to keep it.");
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : "Failed to upload PDF.";
      setError(nextMessage);
    } finally {
      setUploadState((prev) => ({ ...prev, isUploadingPdf: false }));
      event.target.value = "";
    }
  };

  const removePage = (index: number) => {
    setPageImageUrls((prev) => prev.filter((_, i) => i !== index));
    markChanged();
    setMessage("Page image removed locally. Click Save Changes to keep it that way.");
  };

  const clearPdf = () => {
    setPdfUrl("");
    setForm((prev) => ({
      ...prev,
      sourcePdfUrl: "",
    }));
    markChanged();
    setMessage("PDF removed locally. Click Save Changes to keep it that way.");
  };

  const handleDelete = async (itemId: string) => {
    const confirmed = window.confirm(`Delete learning item "${itemId}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingItemId(itemId);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/learning", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      const data = (await response.json()) as LearningApiListResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete learning item.");
      }

      if (editingItemId === itemId) {
        resetForm();
      }

      setMessage("Learning item deleted successfully.");
      await loadItems();
    } catch (err) {
      const nextMessage =
        err instanceof Error ? err.message : "Failed to delete learning item.";
      setError(nextMessage);
    } finally {
      setDeletingItemId("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const payload: LearningItemRecord = {
        itemId: form.itemId.trim(),
        categorySlug: form.categorySlug as LearningCategorySlug,
        titleEn: form.titleEn.trim(),
        titleTet: form.titleTet.trim(),
        descriptionEn: form.descriptionEn.trim(),
        descriptionTet: form.descriptionTet.trim(),
        coverImageUrl: coverImageUrl.trim(),
        pageImageUrls: pageImageUrls.map((item) => item.trim()).filter(Boolean),
        sourcePdfUrl: (pdfUrl || form.sourcePdfUrl).trim() || undefined,
        isPublished: form.isPublished,
        createdAt: isEditing
          ? items.find((item) => item.itemId === editingItemId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!payload.itemId) {
        throw new Error("itemId is required.");
      }

      if (!payload.categorySlug) {
        throw new Error("categorySlug is required.");
      }

      if (!payload.titleEn) {
        throw new Error("English title is required.");
      }

      if (!payload.titleTet) {
        throw new Error("Tetun title is required.");
      }

      if (!payload.coverImageUrl) {
        throw new Error("A cover image is required.");
      }

      if (!payload.pageImageUrls.length) {
        throw new Error("At least one page image is required.");
      }

      const response = await fetch("/api/admin/learning", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LearningApiListResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Failed to ${isEditing ? "update" : "save"} learning item.`
        );
      }

      setMessage(isEditing ? "Learning item updated successfully." : "Learning item saved successfully.");
      resetForm();
      await loadItems();
    } catch (err) {
      const nextMessage =
        err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "save"} learning item.`;
      setError(nextMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminGuard allowedRoles={["Admin", "ContentEditor", "MagazineAdmin", "Communications"]}>
      <main className="min-h-screen bg-[#f5f5f5] px-4 pb-8">
        <div className="sticky top-28 z-30 -mx-4 mb-6 border-b border-[#e5e7eb] bg-white/95 px-4 py-3 backdrop-blur md:top-32">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2">
                <Link
                  href="/admin"
                  className="text-sm font-medium text-[#2F80ED] hover:underline"
                >
                  ← Back to Admin
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-[#1f2937]">Learning Admin</h1>
              <p className="mt-1 text-sm text-[#4b5563]">
                Upload category-based flipbook items for the Learning section.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-[#4b5563]">
                Total: <span className="font-semibold">{items.length}</span>
                {" "}• Published: <span className="font-semibold">{totalPublished}</span>
                {" "}• PDFs: <span className="font-semibold">{totalWithPdf}</span>
                {" "}• Page images: <span className="font-semibold">{totalPages}</span>
                {" "}• Unsaved: <span className={`font-semibold ${hasChanges ? "text-[#b45309]" : "text-[#166534]"}`}>
                  {hasChanges ? "Yes" : "None"}
                </span>
              </div>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isBusy}
                  className="rounded-lg border border-[#d1d5db] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-60"
                >
                  Cancel Edit
                </button>
              ) : null}

              <button
                type="submit"
                form="learning-admin-form"
                disabled={isBusy || !hasChanges}
                className="rounded-lg bg-[#219653] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
                  ? "Update Learning Item"
                  : "Save Learning Item"}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8">
          {hasChanges ? (
            <div className="rounded-lg border border-[#f59e0b] bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
              You have unsaved changes. Click <span className="font-semibold">Save Learning Item</span> or{" "}
              <span className="font-semibold">Update Learning Item</span> before leaving this page.
            </div>
          ) : null}

          {message ? (
            <div className="rounded-lg border border-[#6FCF97] bg-[#ecfdf3] px-4 py-3 text-sm text-[#166534]">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-[#EB5757] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#1f2937]">
                {isEditing ? "Edit Learning Item" : "Add New Learning Item"}
              </h2>
              <p className="mt-1 text-sm text-[#4b5563]">
                {isEditing
                  ? `You are editing ${editingItemId}.`
                  : "Create a new category-based learning item and upload the related files."}
              </p>
            </div>

            <form id="learning-admin-form" className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="itemId" className="mb-2 block text-sm font-medium text-[#374151]">
                    Item ID
                  </label>
                  <input
                    id="itemId"
                    type="text"
                    value={form.itemId}
                    onChange={(event) => handleChange("itemId", event.target.value)}
                    placeholder="stories-seed-saving-01"
                    disabled={isEditing}
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653] disabled:bg-[#f3f4f6] disabled:text-[#6b7280]"
                  />
                </div>

                <div>
                  <label htmlFor="categorySlug" className="mb-2 block text-sm font-medium text-[#374151]">
                    Category
                  </label>
                  <select
                    id="categorySlug"
                    value={form.categorySlug}
                    onChange={(event) =>
                      handleChange("categorySlug", event.target.value as LearningCategorySlug)
                    }
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653]"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="titleEn" className="mb-2 block text-sm font-medium text-[#374151]">
                    Title (English)
                  </label>
                  <input
                    id="titleEn"
                    type="text"
                    value={form.titleEn}
                    onChange={(event) => handleChange("titleEn", event.target.value)}
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653]"
                  />
                </div>

                <div>
                  <label htmlFor="titleTet" className="mb-2 block text-sm font-medium text-[#374151]">
                    Title (Tetun)
                  </label>
                  <input
                    id="titleTet"
                    type="text"
                    value={form.titleTet}
                    onChange={(event) => handleChange("titleTet", event.target.value)}
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <label htmlFor="coverUpload" className="mb-2 block text-sm font-medium text-[#374151]">
                  Cover Image Upload
                </label>
                <input
                  id="coverUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isBusy}
                  className="block w-full text-sm text-[#374151]"
                />
                <p className="mt-2 text-xs text-[#6b7280]">
                  Upload first, then click Save Changes to keep it.
                </p>

                {coverImageUrl ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-lg bg-white p-3 text-xs break-all text-[#374151]">
                      {coverImageUrl}
                    </div>
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="h-auto w-32 rounded-lg border border-[#e5e7eb]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <label htmlFor="pagesUpload" className="mb-2 block text-sm font-medium text-[#374151]">
                  Page Image Uploads
                </label>
                <input
                  id="pagesUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePagesUpload}
                  disabled={isBusy}
                  className="block w-full text-sm text-[#374151]"
                />
                <p className="mt-2 text-xs text-[#6b7280]">
                  Upload the inside pages in reading order, then save the record.
                </p>

                {pageImageUrls.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {pageImageUrls.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 text-xs text-[#374151]"
                      >
                        <span className="break-all">{url}</span>
                        <button
                          type="button"
                          onClick={() => removePage(index)}
                          className="shrink-0 rounded-md border border-[#EB5757] px-2 py-1 text-[#EB5757] hover:bg-[#fff5f5]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="pdfUpload" className="block text-sm font-medium text-[#374151]">
                    Source PDF Upload (optional)
                  </label>

                  {(pdfUrl || form.sourcePdfUrl) ? (
                    <button
                      type="button"
                      onClick={clearPdf}
                      className="rounded-md border border-[#d1d5db] px-2 py-1 text-xs text-[#374151] hover:bg-white"
                    >
                      Clear PDF
                    </button>
                  ) : null}
                </div>

                <input
                  id="pdfUpload"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isBusy}
                  className="block w-full text-sm text-[#374151]"
                />
                <p className="mt-2 text-xs text-[#6b7280]">
                  Upload first, then click Save Changes to keep it.
                </p>

                {(pdfUrl || form.sourcePdfUrl) ? (
                  <div className="mt-3 rounded-lg bg-white p-3 text-xs break-all text-[#374151]">
                    {pdfUrl || form.sourcePdfUrl}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="descriptionEn" className="mb-2 block text-sm font-medium text-[#374151]">
                    Description (English)
                  </label>
                  <textarea
                    id="descriptionEn"
                    rows={4}
                    value={form.descriptionEn}
                    onChange={(event) => handleChange("descriptionEn", event.target.value)}
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653]"
                  />
                </div>

                <div>
                  <label htmlFor="descriptionTet" className="mb-2 block text-sm font-medium text-[#374151]">
                    Description (Tetun)
                  </label>
                  <textarea
                    id="descriptionTet"
                    rows={4}
                    value={form.descriptionTet}
                    onChange={(event) => handleChange("descriptionTet", event.target.value)}
                    className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#219653]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => handleChange("isPublished", event.target.checked)}
                  className="h-4 w-4 rounded border-[#d1d5db]"
                />
                <label htmlFor="isPublished" className="text-sm text-[#374151]">
                  Publish this learning item now
                </label>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1f2937]">Saved Learning Items</h2>
                <p className="mt-1 text-sm text-[#4b5563]">
                  Current items in the learning collection.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#d1d5db] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  {showFilters ? "Hide filters" : "Filters"}
                  {hasActiveFilters ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2F80ED] text-[10px] font-bold text-white">
                      !
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={loadItems}
                  className="rounded-lg border border-[#d1d5db] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
                >
                  Refresh
                </button>
              </div>
            </div>

            {showFilters ? (
              <div className="mb-5 space-y-3 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, description or item ID…"
                  className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-[#219653]"
                />

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">Category</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value as LearningCategorySlug | "all")
                      }
                      className="rounded-lg border border-[#d1d5db] bg-white px-2 py-2 text-sm"
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as "all" | "published" | "draft")
                      }
                      className="rounded-lg border border-[#d1d5db] bg-white px-2 py-2 text-sm"
                    >
                      <option value="all">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">Sort</span>
                    <select
                      value={sortMode}
                      onChange={(event) =>
                        setSortMode(event.target.value as "updated" | "title" | "category")
                      }
                      className="rounded-lg border border-[#d1d5db] bg-white px-2 py-2 text-sm"
                    >
                      <option value="updated">Recently updated</option>
                      <option value="title">Title A–Z</option>
                      <option value="category">Category</option>
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onlyWithPdf}
                      onChange={(event) => setOnlyWithPdf(event.target.checked)}
                      className="h-4 w-4 rounded border-[#d1d5db]"
                    />
                    With PDF
                  </label>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#374151] hover:bg-[#f3f4f6]"
                  >
                    Clear filters
                  </button>
                </div>

                <p className="text-xs text-[#6b7280]">
                  Showing {filteredItems.length} of {items.length} items
                </p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-xl bg-[#fafafa] p-4 text-sm text-[#4b5563]">
                Loading learning items...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl bg-[#fafafa] p-4 text-sm text-[#4b5563]">
                No learning items found yet.
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-4 text-center text-sm text-[#4b5563]">
                No learning items match your filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const categoryLabel =
                    CATEGORY_OPTIONS.find((option) => option.value === item.categorySlug)?.label ||
                    item.categorySlug;

                  return (
                    <div
                      key={item.itemId}
                      className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#1f2937]">
                              {item.titleEn}
                            </h3>
                            <span className="rounded-full bg-[#e8f5ec] px-2 py-1 text-xs font-medium text-[#166534]">
                              {categoryLabel}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                item.isPublished
                                  ? "bg-[#e8f5ec] text-[#166534]"
                                  : "bg-[#f3f4f6] text-[#4b5563]"
                              }`}
                            >
                              {item.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-[#4b5563]">
                            {item.titleTet}
                          </p>

                          <div className="mt-3 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
                            <p>
                              <span className="font-medium">Item ID:</span> {item.itemId}
                            </p>
                            <p>
                              <span className="font-medium">Pages:</span> {item.pageImageUrls.length}
                            </p>
                            <p>
                              <span className="font-medium">PDF:</span> {item.sourcePdfUrl ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-medium">Updated:</span>{" "}
                              {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}
                            </p>
                          </div>

                          <p className="mt-3 text-sm text-[#4b5563]">
                            {item.descriptionEn}
                          </p>
                        </div>

                        {item.coverImageUrl ? (
                          <div className="w-full md:w-32">
                            <img
                              src={item.coverImageUrl}
                              alt={item.titleEn}
                              className="h-auto w-full rounded-lg border border-[#e5e7eb] object-cover"
                            />
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          disabled={deletingItemId === item.itemId}
                          className="rounded-lg border border-[#d1d5db] px-3 py-2 text-sm font-medium text-[#374151] hover:bg-white disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.itemId)}
                          disabled={deletingItemId === item.itemId}
                          className="rounded-lg border border-[#EB5757] px-3 py-2 text-sm font-medium text-[#EB5757] hover:bg-[#fff5f5] disabled:opacity-60"
                        >
                          {deletingItemId === item.itemId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}