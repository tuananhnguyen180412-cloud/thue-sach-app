/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const API = "https://thue-sach-backend.onrender.com";

// Hàm tự thử lần lượt các đường dẫn cho tới khi có cái chạy được
const ORDER_PATHS = ["/orders", "/api/orders", "/rentals", "/api/rentals", "/don-thue"];
const MEMBER_PATHS = ["/members", "/api/members", "/users", "/api/users"];
const BOOK_PATHS = ["/books", "/api/books", "/inventory", "/api/inventory"];

type Raw = Record<string, any>;

interface Order {
  id: string | number;
  member: string;
  book: string;
  date?: string;
  status: string;
}

const pick = (o: Raw, keys: string[]): any => {
  for (const k of keys) {
    const v = k.split(".").reduce((x: any, p) => x?.[p], o);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const normalizeOrder = (o: Raw): Order => ({
  id: pick(o, ["id", "_id", "maDon", "orderCode", "code"]) ?? "",
  member: pick(o, ["memberName", "member.name", "member.fullName", "user.name", "customerName", "hoiVien", "hoiVienThue", "name"]) ?? "",
  book: pick(o, ["bookTitle", "book.title", "book.name", "tenSach", "bookName", "title"]) ?? "",
  date: pick(o, ["rentDate", "rentedAt", "ngayThue", "createdAt", "date"]),
  status: pick(o, ["status", "trangThai", "state"]) ?? "",
});

const STATUS: Record<string, { bg: string; color: string }> = {
  "Đang thuê": { bg: "#e0f2fe", color: "#0369a1" },
  "Đã trả": { bg: "#dcfce7", color: "#15803d" },
  "Quá hạn": { bg: "#fee2e2", color: "#b91c1c" },
  "Đang giao": { bg: "#fef3c7", color: "#a16207" },
};
const OPEN_STATUSES = ["Đang thuê", "Đang giao", "Quá hạn"];
const BAR_COLORS = ["#0284c7", "#0d9488", "#eab308", "#6366f1", "#ec4899"];

const fmtDate = (d?: string): string => {
  if (!d) return "";
  const t = new Date(d);
  return isNaN(t.getTime()) ? String(d) : t.toLocaleDateString("vi-VN");
};

const toArray = (data: any): Raw[] =>
  Array.isArray(data) ? data : data?.data ?? data?.items ?? data?.results ?? [];

// Thử từng đường dẫn, ghi lại lý do thất bại để hiển thị
async function fetchFirst(paths: string[], log: string[]): Promise<Raw[] | null> {
  for (const p of paths) {
    try {
      const res = await fetch(`${API}${p}`);
      if (!res.ok) {
        log.push(`${p} → lỗi ${res.status}`);
        continue;
      }
      const data = toArray(await res.json());
      log.push(`${p} → OK (${data.length} bản ghi)`);
      return data;
    } catch {
      log.push(`${p} → không kết nối được (server ngủ hoặc bị chặn CORS)`);
    }
  }
  return null;
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [members, setMembers] = useState<Raw[]>([]);
  const [books, setBooks] = useState<Raw[]>([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const lines: string[] = [];
    const [o, m, b] = await Promise.all([
      fetchFirst(ORDER_PATHS, lines),
      fetchFirst(MEMBER_PATHS, lines),
      fetchFirst(BOOK_PATHS, lines),
    ]);
    setLog(lines);
    if (!o) setFailed(true);
    setOrders((o ?? []).map(normalizeOrder));
    setMembers(m ?? []);
    setBooks(b ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const openOrders = orders.filter((o) => OPEN_STATUSES.includes(o.status));
    const memberCount =
      members.length || new Set(orders.map((o) => o.member).filter(Boolean)).size;
    const qty = (b: Raw): number =>
      Number(pick(b, ["quantity", "soLuong", "stock", "amount"])) || 0;
    const stock = books.reduce((s, b) => s + qty(b), 0);

    const byCategory: Record<string, number> = {};
    books.forEach((b) => {
      const key = String(pick(b, ["category.name", "category", "theLoai", "genre"]) ?? "Khác");
      byCategory[key] = (byCategory[key] || 0) + qty(b);
    });

    const latest = [...orders]
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
      .slice(0, 5);

    return {
      memberCount,
      stock,
      openCount: openOrders.length,
      overdue: orders.filter((o) => o.status === "Quá hạn").length,
      categories: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
      latest,
    };
  }, [orders, members, books]);

  if (loading)
    return (
      <p style={{ padding: 40 }}>
        Đang tải dữ liệu... (lần đầu server Render có thể mất khoảng 1 phút để khởi động)
      </p>
    );

  if (failed)
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: "#b91c1c", fontWeight: 700 }}>Không tải được danh sách đơn thuê.</p>
        <p style={{ color: "#64748b" }}>Kết quả thử từng đường dẫn:</p>
        <pre style={{ background: "#f1f5f9", padding: 16, borderRadius: 12 }}>{log.join("\n")}</pre>
        <button onClick={load} style={btn}>
          Thử lại
        </button>
      </div>
    );

  const maxCat = Math.max(1, ...stats.categories.map(([, n]) => n));

  return (
    <div style={{ padding: "24px 40px" }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>📊 Thống Kê Tổng Quan</h1>
      <p style={{ color: "#64748b", margin: "4px 0 24px" }}>
        Số liệu hoạt động cho thuê và tồn kho cập nhật trực tiếp.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        <StatCard label="Tổng Hội Viên" value={stats.memberCount} icon="👥" tint="#e0f2fe" />
        <StatCard label="Sách Trong Kho" value={stats.stock.toLocaleString("vi-VN")} icon="📚" tint="#dcfce7" />
        <StatCard
          label="Đơn Cho Thuê Đang Mở"
          value={stats.openCount}
          note={stats.overdue ? `${stats.overdue} đơn quá hạn` : ""}
          icon="📋"
          tint="#fef3c7"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <Panel title="Sách theo thể loại kho">
          {stats.categories.length === 0 && <Empty text="Chưa có dữ liệu kho sách." />}
          {stats.categories.map(([name, n], i) => (
            <div key={name} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span>{name}</span>
                <span style={{ color: "#64748b" }}>{n} quyển</span>
              </div>
              <div style={{ height: 8, background: "#eef2f7", borderRadius: 99 }}>
                <div
                  style={{
                    width: `${(n / maxCat) * 100}%`,
                    height: "100%",
                    borderRadius: 99,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Đơn thuê sách mới nhất">
          {stats.latest.length === 0 && <Empty text="Chưa có đơn thuê nào." />}
          {stats.latest.map((o, i) => {
            const s = STATUS[o.status] || { bg: "#e2e8f0", color: "#334155" };
            return (
              <div
                key={`${o.id}-${i}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderTop: i ? "1px solid #eef2f7" : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{o.member}</div>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    {o.book} • {fmtDate(o.date)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>
                    #{String(o.id).replace(/^#/, "")}
                  </span>
                  <span
                    style={{
                      background: s.bg,
                      color: s.color,
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  note?: string;
  icon: string;
  tint: string;
}

function StatCard({ label, value, note, icon, tint }: StatCardProps) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#64748b" }}>{label}</div>
          <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>{value}</div>
          {note && <div style={{ color: "#b91c1c", fontSize: 13 }}>{note}</div>}
        </div>
        <div
          style={{
            background: tint,
            borderRadius: 12,
            width: 60,
            height: 60,
            display: "grid",
            placeItems: "center",
            fontSize: 26,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ ...card, minHeight: 360 }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 20 }}>{title}</h3>
      {children}
    </div>
  );
}

const Empty = ({ text }: { text: string }) => <p style={{ color: "#94a3b8" }}>{text}</p>;

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e9f0",
  borderRadius: 20,
  padding: 28,
};

const btn: CSSProperties = {
  background: "#0284c7",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: 600,
};

export { Dashboard };
export default Dashboard;