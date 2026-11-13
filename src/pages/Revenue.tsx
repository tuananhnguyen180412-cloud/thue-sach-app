import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface Rental {
  id: number;
  rentalCode: string;
  memberName: string;
  bookTitle: string;
  status: string;
  borrowDate: string;
}

interface Txn {
  code: string;
  customer: string;
  type: string;
  amount: number;
  status: string;
  tone: 'green' | 'blue' | 'gray' | 'amber';
}

const API_URL = import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com';

// ====== BẢNG GIÁ TẠM TÍNH (VNĐ) - chỉnh tại đây ======
const RENTAL_FEE = 20000; // phí thuê mỗi đơn
const DEPOSIT = 50000; // tiền cọc mỗi đơn
const LATE_FEE = 15000; // phí phạt mỗi đơn quá hạn
// ======================================================

const formatMoney = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

// Ngày thuê lưu dạng "13/11/2026" (vi-VN)
const parseBorrowDate = (value: string): Date | null => {
  if (!value) return null;
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isInMonth = (r: Rental, year: number, month: number) => {
  const d = parseBorrowDate(r.borrowDate);
  return !!d && d.getFullYear() === year && d.getMonth() === month;
};

const toneStyle: Record<Txn['tone'], { background: string; color: string }> = {
  green: { background: '#dcfce7', color: '#166534' },
  blue: { background: '#e0f2fe', color: '#0369a1' },
  gray: { background: '#f1f5f9', color: '#334155' },
  amber: { background: '#fef3c7', color: '#92400e' },
};

export function Revenue() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      const res = await axios.get(`${API_URL}/rentals`);
      setRentals(res.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu doanh thu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
    const timer = setInterval(fetchRentals, 30000); // tự cập nhật mỗi 30 giây
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const prev = new Date(curYear, curMonth - 1, 1);

    const thisMonth = rentals.filter((r) => isInMonth(r, curYear, curMonth));
    const lastMonth = rentals.filter((r) => isInMonth(r, prev.getFullYear(), prev.getMonth()));

    // Doanh thu đã thu: không tính đơn "Đang giao" (chưa giao xong)
    const revenueOf = (list: Rental[]) =>
      list.reduce((sum, r) => {
        if (r.status === 'Đang giao') return sum;
        return sum + RENTAL_FEE + (r.status === 'Quá hạn' ? LATE_FEE : 0);
      }, 0);

    const monthRevenue = revenueOf(thisMonth);
    const lastRevenue = revenueOf(lastMonth);
    const changePercent =
      lastRevenue > 0 ? ((monthRevenue - lastRevenue) / lastRevenue) * 100 : null;

    // Tiền cọc đang giữ: các đơn chưa trả
    const heldCount = rentals.filter((r) => r.status !== 'Đã trả').length;
    const depositHeld = heldCount * DEPOSIT;

    const overdueCount = thisMonth.filter((r) => r.status === 'Quá hạn').length;
    const lateRevenue = overdueCount * LATE_FEE;

    const collectedFee = thisMonth.filter((r) => r.status !== 'Đang giao').length * RENTAL_FEE;
    const pendingFee = thisMonth.filter((r) => r.status === 'Đang giao').length * RENTAL_FEE;
    const expected = collectedFee + pendingFee + lateRevenue;

    const pct = (value: number) => (expected > 0 ? Math.round((value / expected) * 100) : 0);

    return {
      monthRevenue,
      changePercent,
      depositHeld,
      heldCount,
      overdueCount,
      lateRevenue,
      expected,
      structure: [
        { label: 'Phí Thuê Sách (đã thu)', percent: pct(collectedFee), color: '#0284c7' },
        { label: 'Đơn Đang Giao (chờ thu)', percent: pct(pendingFee), color: '#16a34a' },
        { label: 'Phí Phạt Quá Hạn', percent: pct(lateRevenue), color: '#d97706' },
      ],
    };
  }, [rentals]);

  // Giao dịch gần đây, sinh ra từ các đơn thuê mới nhất
  const transactions = useMemo<Txn[]>(() => {
    const latest = [...rentals].sort((a, b) => b.id - a.id).slice(0, 5);
    const list: Txn[] = [];

    latest.forEach((r) => {
      const base = `GD${r.rentalCode.replace('#DH', '')}`;

      list.push({
        code: `${base}-1`,
        customer: r.memberName,
        type: 'Phí thuê sách',
        amount: RENTAL_FEE,
        status: r.status === 'Đang giao' ? 'Chờ giao' : 'Hoàn thành',
        tone: r.status === 'Đang giao' ? 'amber' : 'green',
      });

      if (r.status === 'Quá hạn') {
        list.push({
          code: `${base}-2`,
          customer: r.memberName,
          type: 'Phạt quá hạn',
          amount: LATE_FEE,
          status: 'Cần thu',
          tone: 'amber',
        });
      }

      if (r.status === 'Đã trả') {
        list.push({
          code: `${base}-3`,
          customer: r.memberName,
          type: 'Hoàn trả tiền cọc',
          amount: -DEPOSIT,
          status: 'Đã hoàn cọc',
          tone: 'gray',
        });
      } else {
        list.push({
          code: `${base}-3`,
          customer: r.memberName,
          type: 'Đặt cọc sách',
          amount: DEPOSIT,
          status: 'Đang giữ cọc',
          tone: 'blue',
        });
      }
    });

    return list.slice(0, 8);
  }, [rentals]);

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  } as const;

  return (
    <div translate="no" style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          💰 Quản Lý Doanh Thu & Tài Chính
        </h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>
          Thống kê nguồn thu, tiền cọc và lịch sử giao dịch tính từ các đơn thuê sách.
        </p>
      </div>

      {/* 4 thẻ thống kê */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={cardStyle}>
          <div style={{ color: '#475569', marginBottom: '0.5rem' }}>Doanh Thu Tháng Này</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#16a34a' }}>
            {formatMoney(stats.monthRevenue)}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: stats.changePercent !== null && stats.changePercent < 0 ? '#dc2626' : '#16a34a' }}>
            {stats.changePercent === null
              ? 'Chưa có dữ liệu tháng trước'
              : `${stats.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(stats.changePercent).toFixed(1)}% so với tháng trước`}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#475569', marginBottom: '0.5rem' }}>Tổng Tiền Cọc Đang Giữ</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0284c7' }}>
            {formatMoney(stats.depositHeld)}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#64748b' }}>
            Đang thế chấp cho {stats.heldCount} đơn chưa trả
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#475569', marginBottom: '0.5rem' }}>Thu Từ Phạt Quá Hạn</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#d97706' }}>
            {formatMoney(stats.lateRevenue)}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#64748b' }}>
            {stats.overdueCount} lượt trễ hạn tháng này
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ color: '#475569', marginBottom: '0.5rem' }}>Doanh Thu Dự Kiến</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#9333ea' }}>
            {formatMoney(stats.expected)}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#9333ea' }}>
            Gồm cả đơn đang giao
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Cơ cấu nguồn thu */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a' }}>📊 Cơ Cấu Nguồn Thu</h3>
          {stats.structure.map((item) => (
            <div key={item.label} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: '600', color: '#1e293b' }}>
                <span>{item.label}</span>
                <span style={{ color: item.color }}>{item.percent}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '999px', transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Lịch sử giao dịch */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>📜 Lịch Sử Giao Dịch Gần Đây</h3>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Cập nhật tự động</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', borderTop: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1.5rem' }}>Mã GD</th>
                <th style={{ padding: '0.9rem 1rem' }}>Khách hàng</th>
                <th style={{ padding: '0.9rem 1rem' }}>Loại giao dịch</th>
                <th style={{ padding: '0.9rem 1rem' }}>Số tiền</th>
                <th style={{ padding: '0.9rem 1rem' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu từ Backend...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Chưa có giao dịch nào. Hãy tạo đơn thuê ở trang Đơn thuê.</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.code} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.9rem 1.5rem', fontWeight: '600', color: '#64748b' }}>{t.code}</td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: '#0f172a' }}>{t.customer}</td>
                    <td style={{ padding: '0.9rem 1rem', color: '#475569' }}>{t.type}</td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: t.amount >= 0 ? '#16a34a' : '#dc2626' }}>
                      {t.amount >= 0 ? '+' : '-'}{formatMoney(Math.abs(t.amount))}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ ...toneStyle[t.tone], padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem' }}>
        Bảng giá tạm tính: phí thuê {formatMoney(RENTAL_FEE)}/đơn, tiền cọc {formatMoney(DEPOSIT)}/đơn, phạt quá hạn {formatMoney(LATE_FEE)}/đơn.
      </p>
    </div>
  );
}

export default Revenue;