// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const C = {
  bg: "#060609",
  bg2: "#0a0a12",
  bg3: "#0e0e1a",
  bg4: "#111120",
  surface: "rgba(255,255,255,0.035)",
  border: "rgba(255,255,255,0.07)",
  borderHo: "rgba(255,255,255,0.14)",
  red: "#c0392b",
  redGlow: "rgba(192,57,43,0.35)",
  redSubtle: "rgba(192,57,43,0.10)",
  yellow: "#f1c40f",
  text1: "#ffffff",
  text2: "rgba(255,255,255,0.75)",
  text3: "rgba(255,255,255,0.45)",
  text4: "rgba(255,255,255,0.22)",
  green: "#27ae60",
  greenBg: "rgba(39,174,96,0.12)",
  greenBorder: "rgba(39,174,96,0.3)",
  danger: "#f87171",
  dangerBg: "rgba(192,57,43,0.12)",
  dangerBorder: "rgba(192,57,43,0.3)",
};

export const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  ui: "'Syne', 'DM Sans', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

export const ease = "cubic-bezier(0.16,1,0.3,1)";

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
import React, { CSSProperties, ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

// Card wrapper
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Section heading
export function SectionHead({
  label,
  title,
  sub,
}: {
  label: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontFamily: F.ui,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: C.red,
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: F.display,
          fontSize: 28,
          fontWeight: 700,
          color: C.text1,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 13,
            color: C.text3,
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// Primary button
export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 22px",
        background: disabled
          ? "rgba(192,57,43,0.4)"
          : `linear-gradient(135deg, ${C.red}, #e74c3c)`,
        border: "none",
        borderRadius: 12,
        color: "white",
        fontFamily: F.ui,
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : `0 6px 24px ${C.redGlow}`,
        transition: "opacity 0.2s, transform 0.2s",
        whiteSpace: "nowrap" as const,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Ghost button
export function GhostBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        background: "transparent",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        color: C.text3,
        fontFamily: F.ui,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.surface;
        e.currentTarget.style.color = C.text1;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = C.text3;
      }}
    >
      {children}
    </button>
  );
}

// Icon button
export function IconBtn({
  children,
  onClick,
  variant = "default",
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "red" | "danger" | "green";
  href?: string;
}) {
  const colors: Record<string, [string, string]> = {
    default: [C.text3, C.surface],
    red: [C.red, C.redSubtle],
    danger: [C.text3, C.dangerBg],
    green: [C.green, C.greenBg],
  };
  const [color, bg] = colors[variant];
  const sharedStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "transparent",
    border: "none",
    color,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    textDecoration: "none",
    flexShrink: 0,
  };
  if (href)
    return (
      <a
        href={href}
        style={sharedStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = bg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {children}
      </a>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = bg;
        if (variant === "danger") e.currentTarget.style.color = C.danger;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      {children}
    </button>
  );
}

// Badge
export function Badge({
  children,
  variant = "gray",
}: {
  children: ReactNode;
  variant?: "green" | "gray" | "red" | "yellow";
}) {
  const styles: Record<string, CSSProperties> = {
    green: {
      background: C.greenBg,
      color: "#2ecc71",
      border: `1px solid ${C.greenBorder}`,
    },
    gray: {
      background: C.surface,
      color: C.text3,
      border: `1px solid ${C.border}`,
    },
    red: {
      background: C.dangerBg,
      color: C.danger,
      border: `1px solid ${C.dangerBorder}`,
    },
    yellow: {
      background: "rgba(241,196,15,0.12)",
      color: C.yellow,
      border: "1px solid rgba(241,196,15,0.25)",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontFamily: F.ui,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}

// Toggle switch
export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        background: on ? C.green : "rgba(255,255,255,0.10)",
        cursor: "pointer",
        transition: "background 0.25s",
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
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: on ? "translateX(19px)" : "translateX(3px)",
        }}
      />
    </button>
  );
}

// Input field
export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  rows,
  mono,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  rows?: number;
  mono?: boolean;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px 14px",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    color: C.text1,
    fontFamily: mono ? F.mono : F.body,
    fontSize: mono ? 12 : 14,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    resize: rows ? ("vertical" as const) : undefined,
    ...style,
  };
  const focusStyle = {
    borderColor: "rgba(192,57,43,0.6)",
    boxShadow: `0 0 0 3px ${C.redSubtle}`,
  };
  if (rows)
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={base}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    );
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={base}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

// Select field
export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        background: C.bg4,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        color: C.text1,
        fontFamily: F.body,
        fontSize: 14,
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Field wrapper with label
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label
        style={{
          fontFamily: F.ui,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.16em",
          color: C.text4,
        }}
      >
        {label}
      </label>
      {hint && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: C.text4,
            margin: 0,
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

// Form section card
export function FormCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <div
        style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}` }}
      >
        <p
          style={{
            fontFamily: F.ui,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            color: C.text4,
            margin: 0,
          }}
        >
          {title}
        </p>
      </div>
      <div
        style={{
          padding: "22px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Table
export function Table({
  heads,
  children,
}: {
  heads: string[];
  children: ReactNode;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {heads.map((h) => (
              <th
                key={h}
                style={{
                  fontFamily: F.ui,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.16em",
                  color: C.text4,
                  textAlign: "left" as const,
                  padding: "12px 16px",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "13px 16px",
        fontFamily: F.body,
        fontSize: 13,
        color: C.text2,
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      style={{
        transition: "background 0.15s",
        cursor: onClick ? "pointer" : undefined,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Page header
export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap" as const,
        marginBottom: 28,
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
            lineHeight: 1,
            margin: "0 0 6px",
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: C.text4,
              margin: 0,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

// Empty state
export function Empty({
  icon,
  text,
  action,
}: {
  icon: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        gap: 12,
        textAlign: "center" as const,
      }}
    >
      <div style={{ fontSize: 40 }}>{icon}</div>
      <p
        style={{ fontFamily: F.body, fontSize: 14, color: C.text4, margin: 0 }}
      >
        {text}
      </p>
      {action}
    </div>
  );
}

// Confirm modal helper (simple window.confirm)
export function confirmDelete(name: string) {
  return window.confirm(`Delete "${name}"?`);
}

// Stars display
export function Stars({
  rating,
  size = 13,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? C.yellow : "none"}
          stroke={i <= Math.round(rating) ? C.yellow : C.text4}
          strokeWidth={2}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}
