"use client";
import { useEffect, useState, useRef } from "react";
import { blogApi } from "@/lib/api";
import { BlogPost } from "@/types";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiX,
  FiImage,
  FiUpload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { C, F } from "@/components/admin/adminUI";

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  author: "Admin",
  isPublished: false,
  coverImage: "",
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"
).replace(/\/api$/, "");
const getImageUrl = (path?: string) => path ? (path.startsWith("http") ? path : `${API_BASE}${path}`) : "";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await blogApi.adminGetAll();
      setPosts(r.data || []);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setImagePreview("");
    setShowForm(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      author: p.author,
      isPublished: p.isPublished,
      coverImage: p.coverImage || "",
    });
    setImagePreview(getImageUrl(p.coverImage));
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const API =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";
      const endpoint = editing
        ? `${API}/admin/upload/blog/${editing._id}`
        : `${API}/admin/upload/blog-temp`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Upload failed");

      setForm((prev) => ({ ...prev, coverImage: data.data.path }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
      setImagePreview("");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, coverImage: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await blogApi.update(editing._id, form);
        toast.success("Updated!");
      } else {
        await blogApi.create(form);
        toast.success("Created!");
      }
      setShowForm(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await blogApi.delete(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const handleToggle = async (p: BlogPost) => {
    try {
      await blogApi.update(p._id, { isPublished: !p.isPublished });
      toast.success(p.isPublished ? "Unpublished" : "Published!");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
    borderRadius: 11,
    color: C.text1,
    fontFamily: F.body,
    fontSize: 14,
    outline: "none",
  };

  const focus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = "rgba(192,57,43,0.55)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)";
  };
  const blur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = "none";
  };

  const labelStyle = {
    fontFamily: F.ui,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.16em",
    color: C.text4,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: F.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 30,
              fontWeight: 700,
              color: C.text1,
              letterSpacing: "-0.02em",
              margin: "0 0 5px",
            }}
          >
            Blog Posts
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            {posts.length} posts
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            background: "linear-gradient(135deg,#c0392b,#e74c3c)",
            border: "none",
            borderRadius: 11,
            color: "white",
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(192,57,43,0.35)",
          }}
        >
          <FiPlus size={14} /> New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: C.bg3,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Form Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 22px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <p style={{ ...labelStyle, margin: 0 }}>
              {editing ? "Edit Post" : "New Blog Post"}
            </p>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                color: C.text4,
                cursor: "pointer",
                display: "flex",
                padding: 4,
                borderRadius: 6,
              }}
            >
              <FiX size={16} />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            style={{
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={labelStyle}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={inputStyle}
                placeholder="Post title…"
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            {/* Cover Image Upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={labelStyle}>
                Cover Image{" "}
                <span
                  style={{
                    opacity: 0.5,
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (optional)
                </span>
              </label>

              {imagePreview ? (
                /* Preview */
                <div
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.4)",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: 8,
                        color: "white",
                        fontFamily: F.ui,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <FiUpload size={13} /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        background: "rgba(192,57,43,0.5)",
                        border: "1px solid rgba(192,57,43,0.6)",
                        borderRadius: 8,
                        color: "white",
                        fontFamily: F.ui,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <FiX size={13} /> Remove
                    </button>
                  </div>
                  {imageUploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          color: "white",
                          fontFamily: F.ui,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Uploading…
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Drop zone */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "32px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: `2px dashed ${C.border}`,
                    borderRadius: 12,
                    cursor: imageUploading ? "not-allowed" : "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(192,57,43,0.4)";
                    e.currentTarget.style.background = "rgba(192,57,43,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiImage size={20} style={{ color: C.text4 }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: F.ui,
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text3,
                        marginBottom: 4,
                      }}
                    >
                      {imageUploading
                        ? "Uploading…"
                        : "Click to upload cover image"}
                    </div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize: 11,
                        color: C.text4,
                      }}
                    >
                      JPG, PNG, WebP · Max 5MB
                    </div>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>

            {/* Excerpt */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={labelStyle}>
                Excerpt{" "}
                <span
                  style={{
                    opacity: 0.5,
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (shown in listing)
                </span>
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                required
                rows={2}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={labelStyle}>
                Content{" "}
                <span
                  style={{
                    opacity: 0.5,
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  (HTML supported)
                </span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={7}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            {/* Author + Publish toggle */}
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 140,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                <label style={labelStyle}>Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  style={inputStyle}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  paddingBottom: 2,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isPublished: !form.isPublished })
                  }
                  style={{
                    position: "relative",
                    width: 36,
                    height: 20,
                    borderRadius: 999,
                    border: "none",
                    background: form.isPublished
                      ? C.green
                      : "rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "white",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                      transition: "transform 0.25s",
                      transform: form.isPublished
                        ? "translateX(19px)"
                        : "translateX(3px)",
                    }}
                  />
                </button>
                <span
                  style={{
                    fontFamily: F.ui,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.text3,
                  }}
                >
                  Publish now
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                type="submit"
                disabled={saving || imageUploading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 20px",
                  background:
                    saving || imageUploading
                      ? "rgba(192,57,43,0.4)"
                      : "linear-gradient(135deg,#c0392b,#e74c3c)",
                  border: "none",
                  borderRadius: 11,
                  color: "white",
                  fontFamily: F.ui,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: saving || imageUploading ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : editing ? "Update Post" : "Create Post"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 11,
                  color: C.text3,
                  fontFamily: F.ui,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              fontFamily: F.body,
              fontSize: 14,
              color: C.text4,
            }}
          >
            Loading…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p
              style={{
                fontFamily: F.body,
                fontSize: 14,
                color: C.text4,
                margin: 0,
              }}
            >
              No posts yet.{" "}
              <button
                onClick={openNew}
                style={{
                  background: "none",
                  border: "none",
                  color: C.red,
                  fontFamily: F.ui,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Write one!
              </button>
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    "Cover",
                    "Title",
                    "Author",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: F.ui,
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: C.text4,
                        textAlign: "left",
                        padding: "12px 16px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr
                    key={p._id}
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Cover thumbnail */}
                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{
                          width: 52,
                          height: 36,
                          borderRadius: 7,
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {p.coverImage ? (
                          <img
                            src={getImageUrl(p.coverImage)}
                            alt={p.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <FiImage
                            size={16}
                            style={{ color: C.text4, opacity: 0.4 }}
                          />
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "13px 16px", maxWidth: 260 }}>
                      <div
                        style={{
                          fontFamily: F.ui,
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.text1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontFamily: F.body,
                          fontSize: 11,
                          color: C.text4,
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.excerpt}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: F.body,
                        fontSize: 13,
                        color: C.text3,
                      }}
                    >
                      {p.author}
                    </td>

                    <td
                      style={{
                        padding: "13px 16px",
                        fontFamily: F.body,
                        fontSize: 12,
                        color: C.text4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {format(new Date(p.createdAt), "MMM d, yyyy")}
                    </td>

                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontFamily: F.ui,
                          fontSize: 10,
                          fontWeight: 700,
                          background: p.isPublished
                            ? "rgba(39,174,96,0.15)"
                            : C.surface,
                          color: p.isPublished ? "#2ecc71" : C.text3,
                          border: `1px solid ${p.isPublished ? "rgba(39,174,96,0.3)" : C.border}`,
                        }}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {[
                          {
                            icon: p.isPublished ? FiEye : FiEyeOff,
                            action: () => handleToggle(p),
                            color: p.isPublished ? C.green : C.text4,
                          },
                          {
                            icon: FiEdit2,
                            action: () => openEdit(p),
                            color: C.red,
                          },
                          {
                            icon: FiTrash2,
                            action: () => handleDelete(p._id),
                            color: C.text4,
                            danger: true,
                          },
                        ].map(({ icon: Icon, action, color, danger }, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={action}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              background: "transparent",
                              color,
                              cursor: "pointer",
                              transition: "background 0.2s, color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = danger
                                ? "rgba(192,57,43,0.12)"
                                : "rgba(255,255,255,0.06)";
                              if (danger)
                                e.currentTarget.style.color = "#f87171";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = color;
                            }}
                          >
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
