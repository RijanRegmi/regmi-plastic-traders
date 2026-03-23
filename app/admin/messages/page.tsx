"use client";
import { useEffect, useState, useCallback } from "react";
import { messageApi } from "@/lib/api";
import { FiTrash2, FiMail, FiUser, FiCalendar } from "react-icons/fi";
import toast from "react-hot-toast";
import { C, F } from "@/components/admin/adminUI";

interface Message {
  _id: string;
  name: string;
  contact: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await messageApi.adminGetAll();
      setMessages(resp.data || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete message from "${name}"?`)) return;
    try {
      await messageApi.delete(id);
      toast.success("Message deleted");
      load();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const toggleReadStatus = async (m: Message) => {
    try {
      await messageApi.updateStatus(m._id, !m.isRead);
      toast.success(m.isRead ? "Marked as unread" : "Marked as read");
      load();
    } catch {
      toast.error("Failed to update status");
    }
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
            Contact Inquiries
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            {messages.length} total messages received
          </p>
        </div>
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
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: C.text4 }}>
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <FiMail size={40} style={{ color: C.text4, marginBottom: 12 }} />
            <p style={{ color: C.text4, margin: 0 }}>No messages found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Sender", "Contact", "Message Content", "Date", "Status", "Actions"].map((h) => (
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
                {messages.map((m) => (
                  <tr
                    key={m._id}
                    style={{ 
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      background: m.isRead ? "transparent" : "rgba(192,57,43,0.05)"
                    }}
                  >
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: C.surface,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <FiUser size={14} style={{ color: C.text4 }} />
                        </div>
                        <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: m.isRead ? 400 : 700, color: C.text1 }}>
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: 13, color: C.text2, fontWeight: m.isRead ? 400 : 600 }}>{m.contact}</span>
                    </td>
                    <td style={{ padding: "16px", maxWidth: 350 }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: m.isRead ? C.text3 : C.text1,
                          margin: 0,
                          lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {m.message}
                      </p>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.text4, fontSize: 11 }}>
                        <FiCalendar size={11} />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        type="button"
                        onClick={() => toggleReadStatus(m)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "3px 10px",
                          borderRadius: 999,
                          border: "none",
                          fontFamily: F.ui,
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: m.isRead ? "rgba(39,174,96,0.15)" : C.surface,
                          color: m.isRead ? "#2ecc71" : C.text3,
                          outline: `1px solid ${m.isRead ? "rgba(39,174,96,0.3)" : C.border}`,
                        }}
                      >
                        {m.isRead ? "Read" : "Unread"}
                      </button>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(m._id, m.name)}
                          title="Delete Message"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            color: C.text4,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(192,57,43,0.12)";
                            e.currentTarget.style.color = "#f87171";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = C.text4;
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
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
