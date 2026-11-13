import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';

interface Rental {
  id: number;
  rentalCode: string;
  memberName: string;
  bookTitle: string;
  status: string;
  borrowDate: string;
}

// Cấu hình Base URL: ưu tiên biến môi trường trên Vercel, nếu không sẽ dùng trực tiếp Render Backend
const API_URL = import.meta.env.VITE_API_URL || 'https://thue-sach-backend.onrender.com';

export function Rentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [memberName, setMemberName] = useState('');
  const [bookTitle, setBookTitle] = useState('');

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/rentals`);
      setRentals(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn thuê:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleAddRental = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toLocaleDateString('vi-VN');
      await axios.post(`${API_URL}/rentals`, {
        rentalCode: `#DH${Math.floor(100 + Math.random() * 900)}`,
        memberName,
        bookTitle,
        status: 'Đang mượn',
        borrowDate: today,
      });
      setMemberName('');
      setBookTitle('');
      setShowModal(false);
      fetchRentals();
    } catch (err) {
      alert('Lỗi khi tạo đơn thuê!');
    }
  };

  const handleDeleteRental = async (id: number) => {
    if (!window.confirm('Xóa đơn thuê này?')) return;
    try {
      await axios.delete(`${API_URL}/rentals/${id}`);
      fetchRentals();
    } catch (err) {
      alert('Lỗi khi xóa!');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>📋 Quản lý Đơn thuê</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Theo dõi lịch sử mượn trả sách của thư viện qua Render & Aiven</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          + Tạo Đơn Mượn
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '1rem' }}>Mã Đơn</th>
              <th style={{ padding: '1rem' }}>Hội Viên Mượn</th>
              <th style={{ padding: '1rem' }}>Tên Sách</th>
              <th style={{ padding: '1rem' }}>Ngày Mượn</th>
              <th style={{ padding: '1rem' }}>Trạng Thái</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu từ Backend...</td></tr>
            ) : rentals.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Chưa có đơn thuê nào.</td></tr>
            ) : (
              rentals.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#0284c7' }}>{item.rentalCode}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{item.memberName}</td>
                  <td style={{ padding: '1rem' }}>{item.bookTitle}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{item.borrowDate}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteRental(item.id)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ marginTop: 0 }}>Tạo Đơn Mượn Sách</h2>
            <form onSubmit={handleAddRental} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Tên Hội Viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên hội viên..."
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Tên Sách Mượn *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên sách..."
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer' }}
                >
                  Lưu Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}