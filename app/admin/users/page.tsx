"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiSave,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiMail,
  FiAlertTriangle,
} from "react-icons/fi";
import { C, F } from "@/components/admin/adminUI";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

const IB: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  color: C.text1,
  fontFamily: F.body,
  fontSize: 14,
  outline: "none",
};

const BADGE = (role: string) => ({
  display: "inline-flex" as const,
  alignItems: "center" as const,
  gap: 5,
  padding: "4px 10px",
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 700,
  fontFamily: F.ui,
  background: role === "admin" ? "rgba(192,57,43,0.12)" : "rgba(255,255,255,0.06)",
  color: role === "admin" ? C.red : C.text3,
  border: `1px solid ${role === "admin" ? "rgba(192,57,43,0.25)" : C.border}`,
});

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: F.display,
              fontSize: 20,
              fontWeight: 700,
              color: C.text1,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: C.text3,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── User Form ────────────────────────────────────────────────────────────────
function UserForm({
  initial,
  onSave,
  onClose,
  isEdit,
}: {
  initial?: Partial<AdminUser>;
  onSave: (data: Record<string, string>) => Promise<void>;
  onClose: () => void;
  isEdit: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    role: initial?.role || "admin",
  });
  const [saving, setSaving] = useState(false);

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontFamily: F.ui,
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: C.text4,
        }}
      >
        {label}
        {key === "password" && isEdit && (
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
            (leave blank to keep current)
          </span>
        )}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={IB}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(192,57,43,0.55)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192,57,43,0.10)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    if (!isEdit && !form.password.trim()) { toast.error("Password is required"); return; }
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (form.password.trim()) payload.password = form.password;
      await onSave(payload);
      onClose();
    } catch {
      // errors handled in parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {field("name", "Full Name", "text", "John Doe")}
      {field("email", "Email Address", "email", "admin@example.com")}
      {field("password", "Password", "password", isEdit ? "••••••••" : "Min. 6 characters")}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          style={{
            fontFamily: F.ui,
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: C.text4,
          }}
        >
          Role
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {["admin", "user"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: r as "admin" | "user" }))}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${form.role === r ? "rgba(192,57,43,0.4)" : C.border}`,
                background: form.role === r ? "rgba(192,57,43,0.12)" : "rgba(255,255,255,0.03)",
                color: form.role === r ? C.red : C.text3,
                fontFamily: F.ui,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {r === "admin" ? <><FiShield size={12} style={{ marginRight: 5 }} />Admin</> : <><FiUser size={12} style={{ marginRight: 5 }} />User</>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.text3,
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          style={{
            flex: 2,
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: saving ? "rgba(192,57,43,0.4)" : "linear-gradient(135deg,#c0392b,#e74c3c)",
            color: "white",
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: saving ? "none" : "0 6px 20px rgba(192,57,43,0.30)",
          }}
        >
          {saving ? <FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiSave size={14} />}
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
  user,
  onConfirm,
  onClose,
}: {
  user: AdminUser;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Delete User" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(192,57,43,0.12)",
            color: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <FiAlertTriangle size={24} />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.text3, margin: "0 0 6px" }}>
          Are you sure you want to delete
        </p>
        <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 700, color: C.text1, margin: 0 }}>
          {user.name}
        </p>
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.text4, marginTop: 4 }}>
          {user.email}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.text3,
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
          disabled={busy}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: busy ? "rgba(192,57,43,0.4)" : C.red,
            color: "white",
            fontFamily: F.ui,
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {busy ? <FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiTrash2 size={14} />}
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?._id || null;
  const currentUserRole = currentUser?.role || null;
  const isAdmin = currentUserRole === "admin";

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserRole && currentUserRole !== "admin") {
      router.push("/admin");
      return;
    }
    load();
  }, [currentUserRole, router]);

  const handleCreate = async (data: Record<string, string>) => {
    try {
      await userApi.create(data as { name: string; email: string; password: string; role: string });
      toast.success("User created!");
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create user";
      toast.error(msg);
      throw err;
    }
  };

  const handleUpdate = async (data: Record<string, string>) => {
    if (!selected) return;
    try {
      await userApi.update(selected._id, data);
      toast.success("User updated!");
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update user";
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await userApi.delete(selected._id);
      toast.success("User deleted");
      setModal(null);
      setSelected(null);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete user";
      toast.error(msg);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, fontFamily: F.body }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: 28,
              fontWeight: 700,
              color: C.text1,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
            }}
          >
            Admin Users
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.text4, margin: 0 }}>
            Manage who has access to the admin panel.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setSelected(null); setModal("create"); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              background: "linear-gradient(135deg,#c0392b,#e74c3c)",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontFamily: F.ui,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(192,57,43,0.30)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <FiPlus size={15} /> Add Admin User
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto auto",
            padding: "12px 22px",
            borderBottom: `1px solid ${C.border}`,
            gap: 16,
          }}
        >
          {["Name / Email", "Role", "Joined", "Actions"].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: F.ui,
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.text4,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.red, animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontFamily: F.body, fontSize: 14, color: C.text4 }}>Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <FiUsers size={36} style={{ color: C.text4, opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.text4 }}>No users found.</p>
          </div>
        ) : (
          users.map((user, i) => {
            const isMe = user._id === currentUserId;
            return (
              <div
                key={user._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto auto",
                  padding: "16px 22px",
                  gap: 16,
                  alignItems: "center",
                  borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Name / Email */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "rgba(192,57,43,0.12)",
                      color: C.red,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontFamily: F.display,
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.text1, display: "flex", alignItems: "center", gap: 8 }}>
                      {user.name}
                      {isMe && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.text4, background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 99, border: `1px solid ${C.border}` }}>
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: 11, color: C.text4, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                      <FiMail size={10} /> {user.email}
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span style={BADGE(user.role)}>
                    {user.role === "admin" ? <FiShield size={10} /> : <FiUser size={10} />}
                    {user.role}
                  </span>
                </div>

                {/* Joined */}
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.text4, whiteSpace: "nowrap" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  {isAdmin ? (
                    <>
                      <button
                        title="Edit"
                        onClick={() => { setSelected(user); setModal("edit"); }}
                        style={{
                          width: 32, height: 32, borderRadius: 9,
                          background: "rgba(255,255,255,0.05)",
                          border: `1px solid ${C.border}`,
                          color: C.text3, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(192,57,43,0.3)"; e.currentTarget.style.color = C.red; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text3; }}
                      >
                        <FiEdit3 size={13} />
                      </button>
                      <button
                        title={isMe ? "Cannot delete your own account" : "Delete"}
                        disabled={isMe}
                        onClick={() => { setSelected(user); setModal("delete"); }}
                        style={{
                          width: 32, height: 32, borderRadius: 9,
                          background: isMe ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isMe ? "rgba(255,255,255,0.04)" : C.border}`,
                          color: isMe ? "rgba(255,255,255,0.15)" : C.text3,
                          cursor: isMe ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        onMouseEnter={(e) => { if (!isMe) { e.currentTarget.style.borderColor = "rgba(192,57,43,0.3)"; e.currentTarget.style.color = C.red; } }}
                        onMouseLeave={(e) => { if (!isMe) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text3; } }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </>
                  ) : (
                    <div style={{ fontFamily: F.ui, fontSize: 10, color: C.text4, padding: "0 8px", fontStyle: "italic" }}>
                      Read-only
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats footer */}
      {!loading && users.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Total Users", value: users.length, icon: FiUsers },
            { label: "Admins", value: users.filter((u) => u.role === "admin").length, icon: FiShield },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(192,57,43,0.10)", color: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.text1, lineHeight: 1 }}>{value}</div>
                <div style={{ fontFamily: F.body, fontSize: 11, color: C.text4, marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === "create" && (
        <Modal title="Add Admin User" onClose={() => setModal(null)}>
          <UserForm isEdit={false} onSave={handleCreate} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal title="Edit User" onClose={() => setModal(null)}>
          <UserForm isEdit initial={selected} onSave={handleUpdate} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm user={selected} onConfirm={handleDelete} onClose={() => setModal(null)} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
